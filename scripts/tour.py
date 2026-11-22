#!/usr/bin/env python3
"""
Contact sheets of the screenshots from scripts/e2e.mjs, for looking at every screen at once.

  python3 scripts/tour.py <shots dir> <out dir>

Writes 1-player-phones.jpg, 2-narrator-phone.jpg and 3-big-screen.jpg.
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

def font(size, mono=True):
    for path in ('/System/Library/Fonts/Courier.ttc', '/System/Library/Fonts/Menlo.ttc', '/System/Library/Fonts/Helvetica.ttc'):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

SHEETS = {
    '1-player-phones': ('Every player\'s phone, in order', 5, 300, [
        ('03-join-form', '1. Get booked'), ('05-player-lobby', '2. Wait in the cabin'), ('05b-phone-how-to', 'The guide (any time)'),
        ('05c-phone-guide-files', 'Tap a file in the guide'), ('05d-phone-guide-role', 'The page turns to that role'),
        ('07-reveal-hidden', '3. Your file arrives'), ('08-reveal-peek', 'Hold to open it'), ('10-play-day0', '4. Files are out'),
        ('13-phone-night', '5. Night falls'), ('19-phone-mafia-morning', '6. The morning paper'), ('18-phone-ghost', 'If you were killed'),
        ('24b-phone-vote', '7. The vote'), ('25b-phone-verdict', '8. The verdict'), ('26b-phone-case-closed', '9. Case closed'), ('28-phone-who-was-who', 'Who was who'),
    ]),
    '2-narrator-phone': ('Your narrator phone (the remote)', 5, 300, [
        ('06-narrator-lobby', 'Lobby: who is booked'), ('06b-narrator-birthday', 'Tap the cake: birthday girl'), ('06c-narrator-briefing', 'Briefing tab: what to say'),
        ('06c-narrator-suspects', 'Suspects tab'), ('06c-narrator-scenes', 'Scenes tab + fix a mistake'), ('11-narrator-dealt', 'Files are out'),
        ('14-narrator-night-0', 'Night: read the script'), ('15-narrator-mafia-pick', 'Tap who the Mafia chose'), ('16-narrator-detective', 'Ranger check: thumbs up/down'),
        ('20-narrator-morning', 'Morning: break the news'), ('22-narrator-day', 'Talk timer running'), ('24c-narrator-vote', 'Vote: tap who is out'),
        ('25c-narrator-after-vote', 'After the vote'), ('29-narrator-end', 'The end: play again'),
    ]),
    '3-big-screen': ('The laptop or TV', 3, 640, [
        ('01-home-laptop', 'Home: open the case'), ('02-table-lobby', 'Join code, before anyone joins'), ('04b-table-lobby-birthday', 'People walk into the cabin'),
        ('12-table-night', 'Night falls'), ('17-table-morning-dead', 'The morning paper'), ('21-table-discussion', 'Talk it out, with timer'),
        ('24-table-vote', 'The vote'), ('25-table-eliminated', 'The verdict'), ('26-table-town-wins', 'Case closed'), ('30-tv', 'A second screen (TV code)'),
    ]),
}

for name, (title, cols, w, items) in SHEETS.items():
    items = [(f, cap) for f, cap in items if os.path.exists(os.path.join(src, f + '.png'))]
    thumbs = []
    for f, cap in items:
        im = Image.open(os.path.join(src, f + '.png')).convert('RGB')
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        thumbs.append((im, cap))
    pad, top, lab = 22, 80, 56
    th = max(im.height for im, _ in thumbs)
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new('RGB', (pad + cols * (w + pad), top + rows * (th + lab + pad)), (26, 20, 16))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 26), title, fill=(233, 184, 36), font=font(34))
    for i, (im, cap) in enumerate(thumbs):
        x, y = pad + (i % cols) * (w + pad), top + (i // cols) * (th + lab + pad)
        sheet.paste(im, (x, y))
        d.text((x, y + im.height + 10), cap, fill=(241, 232, 214), font=font(20 if w < 400 else 24))
    sheet.save(os.path.join(out, name + '.jpg'), quality=86)
    print(name, sheet.size, len(thumbs))
