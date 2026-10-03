# Gera build/icon.png (1024x1024) no grid de ícones do macOS: placa de 824 px com cantos
# arredondados e margem transparente. Mesmo desenho do app de Windows: placa preta,
# retícula verde-limão e o asterisco do piraru*. O electron-builder converte em .icns.
import zlib, struct, math, os

S = 1024
PLATE = 824
M = (S - PLATE) // 2          # 100 px de margem, como no grid da Apple
R = 185                       # raio do canto da placa
BLACK = (10, 10, 10)
LIME = (182, 255, 0)          # #B6FF00, cor do vídeo de abertura

def P(fx, fy):                # posição relativa à placa
    return (M + fx * PLATE, M + fy * PLATE)

CELL = 0.051 * PLATE          # célula da retícula
AST_C = P(0.706, 0.294)       # centro do asterisco
AST_L, AST_W = 0.131 * PLATE, 0.032 * PLATE
TONE_C, TONE_R = P(0.087, 0.934), 0.976 * PLATE


def sstep(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


ARMS = []
for k in range(3):
    a = math.radians(90 + k * 60)
    ARMS.append((AST_C[0] - math.cos(a) * AST_L, AST_C[1] - math.sin(a) * AST_L,
                 AST_C[0] + math.cos(a) * AST_L, AST_C[1] + math.sin(a) * AST_L))

px = bytearray(S * S * 4)
ang = math.radians(45)
ca, sa = math.cos(ang), math.sin(ang)
halo0, halo1 = 0.021 * PLATE, 0.028 * PLATE
for y in range(S):
    for x in range(S):
        qx = max(M + R - x, 0, x - (S - M - R))
        qy = max(M + R - y, 0, y - (S - M - R))
        a = 1 - sstep(-1, 1, math.hypot(qx, qy) - R)
        if a <= 0:
            continue
        u = (x * ca + y * sa) / CELL
        v = (-x * sa + y * ca) / CELL
        fu, fv = u - math.floor(u) - .5, v - math.floor(v) - .5
        d = math.hypot(fu, fv) * CELL
        tone = max(0.0, min(1.0, 0.78 - math.hypot(x - TONE_C[0], y - TONE_C[1]) / TONE_R))
        r = CELL * 0.66 * math.sqrt(tone)
        dot = 1 - sstep(r - 1.2, r + 1.2, d)
        ad = min(seg_dist(x, y, *arm) for arm in ARMS) - AST_W
        dot *= sstep(halo0, halo1, ad)            # halo preto em volta do asterisco
        ink = max(dot, 1 - sstep(-1.2, 1.2, ad))  # asterisco sólido
        col = [BLACK[i] + (LIME[i] - BLACK[i]) * ink for i in range(3)]
        o = (y * S + x) * 4
        px[o:o + 4] = bytes([int(col[0]), int(col[1]), int(col[2]), int(a * 255)])


def chunk(t, d):
    return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)


raw = b''.join(b'\x00' + bytes(px[y * S * 4:(y + 1) * S * 4]) for y in range(S))
os.makedirs('build', exist_ok=True)
with open('build/icon.png', 'wb') as f:
    f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', S, S, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))
print('build/icon.png gerado (1024 px, grid macOS)')
