import re

bench_path = 'apps/api/src/domain/ai/synthetic-sos-benchmark.ts'
with open(bench_path, 'r', encoding='utf-8') as f:
    content = f.read()

villages = [
    ('ছাগলনাইয়া', 'Chhagalnaiya', 'wh0x'),
    ('কোম্পানীগঞ্জ', 'Companiganj', 'wh1q'),
    ('গোয়াইনঘাট', 'Gowainghat', 'wh1r'),
    ('সুনামগঞ্জ সদর', 'Sunamganj Sadar', 'wh1k'),
    ('তাহিরপুর', 'Tahirpur', 'wh1m'),
    ('ধরমপাশা', 'Dharampasha', 'wh1j'),
    ('কুড়িগ্রাম সদর', 'Kurigram Sadar', 'wh2b'),
    ('উলিপুর', 'Ulipur', 'wh28'),
    ('চিলমারী', 'Chilmari', 'wh22'),
    ('ফুলগাজী', 'Fulgazi', 'wh0w'),
    ('পরশুরাম', 'Parshuram', 'wh0x'),
    ('সোনাগাজী', 'Sonagazi', 'wh0s'),
    ('দাগনভূঞা', 'Daganbhuiyan', 'wh0t')
]

trends = [
    ('পানি খুব দ্রুত বাড়ছে', 'RISING_RAPID', 'Pani khub druto barchhe'),
    ('পানি এক কোমরে উঠছে', 'RISING_STEADY', 'Pani komor soman'),
    ('পানি স্থির আছে', 'STABLE', 'Pani sthir ache'),
    ('পানি কমতে শুরু করেছে', 'FALLING', 'Pani komchhe')
]

categories = ['BANGLA_FORMAL', 'BANGLISH', 'BANGLA_COLLOQUIAL']
new_items = []

for i in range(101, 251):
    v_bn, v_en, gh = villages[(i - 101) % len(villages)]
    p_cnt = (i % 12) + 1
    t_text_bn, t_val, t_text_en = trends[(i % 4)]
    is_elderly = (i % 3 == 0)
    is_child = (i % 4 == 0)
    is_medical = (i % 5 == 0)
    is_trapped = True
    cat = categories[i % 3]
    
    if cat == 'BANGLA_FORMAL':
        text = f"{v_bn} এলাকায় {p_cnt} জন লোক পানিবন্দী। {t_text_bn}। "
        if is_elderly: text += "বৃদ্ধ মানুষ আছেন। "
        if is_child: text += "ছোট শিশু আছে। "
        if is_medical: text += "জরুরি ওষুধ ও চিকিৎসক দরকার। "
        text += "নৌকা প্রয়োজন।"
    elif cat == 'BANGLISH':
        text = f"{v_en} e {p_cnt} jon manush stranded. {t_text_en}. "
        if is_elderly: text += "Ekjon elderly person ache. "
        if is_child: text += "Bacha ache shathe. "
        if is_medical: text += "Urgent medicine darkar. "
        text += "Rescue boat pathan please."
    else:
        text = f"{v_bn} চরে পানি উঠতাছে, {p_cnt} জন ছাদে আটকাই রইছি। {t_text_bn}। "
        if is_elderly: text += "বুড়া মুরুব্বি আছে। "
        if is_child: text += "দুধের বাচ্চা আছে। "
        if is_medical: text += "রোগী খুব অসুস্থ। "
        text += "তাড়াতাড়ি সাহায্য পাঠান।"

    item_str = f"""  {{
    id: "msg-{i}",
    text: "{text}",
    expectedPeopleCount: {p_cnt},
    expectedTrapped: {str(is_trapped).lower()},
    expectedElderly: {str(is_elderly).lower()},
    expectedChild: {str(is_child).lower()},
    expectedMedical: {str(is_medical).lower()},
    expectedWaterTrend: "{t_val}",
    category: "{cat}",
  }},"""
    new_items.append(item_str)

full_new_content = '\n'.join(new_items)
insert_point = content.rfind('];')
if insert_point != -1:
    updated = content[:insert_point] + full_new_content + '\n' + content[insert_point:]
    with open(bench_path, 'w', encoding='utf-8') as f:
        f.write(updated)
    print(f"Successfully expanded benchmark from 100 to 250 items in {bench_path}")

