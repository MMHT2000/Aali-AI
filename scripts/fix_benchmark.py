p = 'apps/api/src/domain/ai/synthetic-sos-benchmark.ts'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('"FALLING"', '"RECEDING"')
with open(p, 'w', encoding='utf-8') as f:
    f.write(c)
print("Successfully replaced FALLING with RECEDING")

