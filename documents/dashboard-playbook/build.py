#!/usr/bin/env python3
"""
build.py — generates the CZTVN Dashboard Field Playbook (Grade A1).

One source of truth (the CONTENT list below) → two outputs:
  * The-CZTVN-Dashboard-Playbook-CZAR-PLAY-2026-0712.pdf  (the A1 document)
  * The-CZTVN-Dashboard-Playbook-CZAR-PLAY-2026-0712.md   (readable mirror)

Theme: action-oriented, light paper background with bold color throughout —
a colored band on every page, per-section accent colors keyed to the platforms
(GitHub / Reddit / YouTube), full-bleed color section dividers.

Run:  python build.py
Deps: reportlab  (pip install --user reportlab)
"""

import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, Color
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# ─────────────────────────────────────────────────────────────── identity ──
DOC_ID     = "CZAR-PLAY-2026-0712"
DATE_STR   = "July 12, 2026"
PLACE      = "Shannon, Georgia"
PRESENTER  = "The Traffic Motorist Czar Television Network, Inc. presents"
TITLE      = "The CZTVN Dashboard"
SUBTITLE   = "A field playbook — run it today, deepen it tomorrow, turn it into a channel."
ENTITY     = "DJWZ Holdings LLC  ·  859SSCS1  ·  Shannon, Georgia"
BASENAME   = "The-CZTVN-Dashboard-Playbook-" + DOC_ID

# ───────────────────────────────────────────────────────────────── palette ──
PAPER  = HexColor("#FBF9F4")   # warm light paper
INK    = HexColor("#17171E")   # near-black text
MUTED  = HexColor("#6B6B72")   # secondary text
HAIR   = HexColor("#DFD9CE")   # hairline on paper
WHITE  = HexColor("#FFFFFF")
GOLD   = HexColor("#C9962B")   # brand gold

def tint(c, p):
    """Lighten a color toward paper by fraction p (0..1)."""
    r = c.red   + (PAPER.red   - c.red)   * p
    g = c.green + (PAPER.green - c.green) * p
    b = c.blue  + (PAPER.blue  - c.blue)  * p
    return Color(r, g, b)

# ────────────────────────────────────────────────────────────── geometry ──
PW, PH = letter                 # 612 x 792
LM, RM = 62, 62
TOP_BAND = 50                   # colored header band height
CONTENT_TOP = TOP_BAND + 34     # first content baseline-from-top
BOTTOM = 64                     # footer keep-out
CW = PW - LM - RM               # content width

# ─────────────────────────────────────────────────────────── paragraph css ──
def style(name, size, leading, color, font="Helvetica", align=TA_LEFT, space=0):
    return ParagraphStyle(name, fontName=font, fontSize=size, leading=leading,
                          textColor=color, alignment=align, spaceAfter=space)

S_BODY  = style("body", 10.5, 15.5, INK)
S_LEAD  = style("lead", 12.5, 18, INK, font="Helvetica")
S_H     = style("h",   14,  17, INK, font="Helvetica-Bold")
S_CALLT = style("ct",  11,  14, WHITE, font="Helvetica-Bold")
S_CALLB = style("cb",  10.5,15.5, INK)
S_QUOTE = style("q",   15,  20, INK, font="Helvetica-Oblique")
S_BUL   = style("bul", 10.5,15,   INK)

def P(text, st):
    return Paragraph(text, st)

# ───────────────────────────────────────────────────────────────── content ──
# Block kinds: ("h", txt) ("p", txt) ("lead", txt) ("bul", [..])
#              ("call", title, body) ("quote", txt) ("gap", pts)
CONTENT = [
 dict(roman="I", kicker="TODAY", title="What's Built — and How to Use It Right Now",
      sub="The v1.0 you can open, broadcast with, and start owning data on today.",
      accent=HexColor("#F26B21"), blocks=[
   ("lead","You are not waiting on anything to start. v1.0 is a working desktop app — a branded Windows <b>.exe</b>, CZTVN Dashboard — plus a contributor streaming hub. It performs on camera and quietly banks data while it does. Here is everything in your hand today, and the exact moves to make with it."),
   ("h","What shipped"),
   ("bul",[
     "<b>The Dashboard (Data view)</b> — a live congestion map (TomTom traffic tiles), incident panels, a scrolling ticker, and the metro gauge. Point it at Georgia; it is centered on Atlanta.",
     "<b>The Daily Road Card</b> — one button renders a clean few-stat card to the screen, a PNG, and a PDF. On a schedule it fires itself.",
     "<b>The Live Board</b> — a self-sorting city wall (worst-first), instant jump, a camera-or-map hero per corridor, a self-running Traffic Channel, and Speeder Watch (aggregate flow only — never an individual).",
     "<b>The owned archive</b> — every real 511 incident the app pulls lands in an append-only file you keep. That file is the first seed of CMMD.",
     "<b>The Contributor Grid hub</b> — a MediaMTX server that turns any phone into a live corridor feed you pull up on the Live Board (live-view-only at this stage).",
   ]),
   ("h","Do these five things today"),
   ("bul",[
     "<b>Launch it.</b> Run the .exe (key in the <b>.env</b> beside it). Confirm the map colors with live traffic and the gauge reads a live number.",
     "<b>Put it on OBS.</b> Open the Live Board in its own window and add it as a capture source. This is your studio — the product and the broadcast tool are the same object.",
     "<b>Fire a Road Card.</b> Generate one, watch the PNG and PDF land in the out folder. That is your first shareable, on-brand asset.",
     "<b>Run the Traffic Channel.</b> Press C and let it rotate cities and corridors on its own — instant ambient broadcast content with zero hosting effort.",
     "<b>Prove the grid.</b> Point a phone's RTMP broadcaster at the hub and watch yourself appear in the corridor hero. That is contributor capture, working.",
   ]),
   ("call","THE ONE MOVE TODAY","Record a 60-second clip of the Live Board running live traffic with a Road Card overlay. That single clip is proof-of-capability — it is what every later section (GitHub, Reddit, YouTube) points back to."),
   ("p","Nothing here is a demo. It installs, it opens, it shows live roads, and it writes a file you own. The only thing standing between you and a broadcast is pressing record."),
 ]),

 dict(roman="II", kicker="TOMORROW", title="After the GA 511 Key — the Archive Comes Alive",
      sub="The moment real incidents replace sample data, the app stops being a window and becomes a record.",
      accent=HexColor("#1FA05A"), blocks=[
   ("lead","Right now the incident panels show clearly-marked SAMPLE data so the app runs end to end. Your GA 511 developer key — requested, pending approval — is the single switch that makes them real. When it lands, this is the day the machine grows a memory."),
   ("h","Wire it in (about two minutes)"),
   ("bul",[
     "Open <b>.env</b> and paste the approved key as <b>GA511_API_KEY</b>.",
     "Restart the app. The incident panel, ticker, map markers, <b>and the archive</b> all switch to the live Georgia feed automatically — it is already wired.",
     "Watch <b>data/archive/ga.jsonl</b>. The first time a new line appears, you own your first piece of real, dated corridor data.",
   ]),
   ("h","What changes the instant it is live"),
   ("bul",[
     "<b>The broadcast gets true.</b> Real crashes, closures, and construction scroll the ticker and drop pins on the map — credible, current, Georgia-specific.",
     "<b>The archive starts compounding.</b> Every pull appends only what is new, de-duplicated. Leave the app running and the file grows daily on its own.",
     "<b>The CMMD seed is real.</b> Sample rows are refused from the archive by design — so what accumulates is genuine owned data from day one.",
   ]),
   ("h","Then widen the net"),
   ("p","Georgia is the wired example; the other three states are one field each. As you get their feeds, paste each state's incident URL into <b>config/states.json</b> — Tennessee (SmartWay/TDOT), Ohio (OHGO), Florida (FL511) all publish developer feeds. The field-mapper already handles the common shapes; hand a sample response to Claude Code if a state names things differently."),
   ("call","THE ONE MOVE TOMORROW","The day GA 511 approves, do nothing else until ga.jsonl has its first real line — then screenshot it. “The archive is now collecting real Georgia incidents” is your first genuine build-in-public milestone, and the first dot on the CMMD timeline."),
   ("quote","A live window shows you traffic. A growing archive lets you own the beginning of it. The GA 511 key is the difference between the two."),
 ]),

 dict(roman="III", kicker="NEXT WEEK", title="When Paid Data Enters the Budget — the Deluxe Turn",
      sub="The same machine, upgraded from rented feeds to licensed, ownable data.",
      accent=GOLD, blocks=[
   ("lead","The capstone sets the paid turn as the milestone where the entity opens its bank account — with one rule: the first dollar points at something <b>ownable</b>, not merely rented. You do not need 2028 to prepare the on-ramp. The week a paid, licensable dataset fits the budget, here is how the same app becomes the deluxe app."),
   ("h","The rule that governs the first dollar"),
   ("p","Rented data (TomTom) is streamed live and never stored — you have access, not ownership. Licensed data is the opposite: you buy the right to keep it. So the first paid transaction should be the first dataset you are allowed to archive. That single distinction is the whole thesis in one purchase."),
   ("h","What the deluxe turn unlocks"),
   ("bul",[
     "<b>The map gains a memory</b> — it stops showing only ‘now’ and starts showing the same corridors over time.",
     "<b>Movement becomes visible</b> — origin-to-destination and flow patterns, not just a color.",
     "<b>City-cycle expertise auto-narrates</b> — the app can speak to what a corridor usually does at this hour, because it has the history.",
     "<b>The archive compounds daily</b> — and becomes the direct bridge to CMMD's own corridor capture.",
   ]),
   ("h","The buying discipline for that week"),
   ("bul",[
     "<b>Buy narrow and ownable.</b> One corridor's licensed history beats a broad snapshot you cannot keep.",
     "<b>Confirm the license lets you archive.</b> If you cannot store it, it is rent with a nicer invoice — skip it.",
     "<b>Wire it beside the free tier, not instead of it.</b> The free app keeps performing; the paid layer makes it richer underneath.",
   ]),
   ("call","THE ONE MOVE NEXT WEEK","Before spending a dollar, write down the exact question a year of one owned corridor would answer that a bought snapshot never could. If you can name it, you have found the first ownable purchase. If you cannot, keep accumulating the free 511 archive — it is already the cheapest version of the same asset."),
   ("quote","A snapshot of traffic is a commodity — anyone can buy it. A year of the same corridors, clean and continuous, is not."),
 ]),

 dict(roman="IV", kicker="GITHUB", title="Make It Land on GitHub",
      sub="Turn the private repo into a public credential that recruits its own audience.",
      accent=HexColor("#6E40C9"), blocks=[
   ("lead","The repo is live and private under 859SSCS1, MIT-shelled, secrets kept out of history. GitHub is not just storage — it is the first public proof that you build. Here is how to make it read as a serious, living project the moment someone lands on it."),
   ("h","Before you flip it public"),
   ("bul",[
     "<b>Write the README for a stranger.</b> One screenshot or GIF of the Live Board up top, a one-line ‘what it is,’ a three-line ‘run it,’ and the honest ‘v1 scope.’ The first screen decides everything.",
     "<b>Add topics</b> — electron, traffic, opendata, dashboard, obs, georgia. Topics are how people find you without knowing your name.",
     "<b>Keep the LICENSE and .gitignore</b> you already have — MIT signals ‘build on this,’ the ignore keeps keys and data out.",
   ]),
   ("h","Flip it, then make it a release"),
   ("bul",[
     "Go public: <b>gh repo edit 859SSCS1/thetrafficmotoristCZAR-dashboard --visibility public</b>.",
     "<b>Cut v1.0.0 as a GitHub Release</b> and attach the built installer .exe. A downloadable release is what turns a code repo into a product people can actually run.",
     "Tag the release notes with the honest v1 framing — what works, what is staged (blur, WebRTC, paid data).",
   ]),
   ("h","Make it a living record, not a dump"),
   ("bul",[
     "<b>Commit in public with a cadence</b> — small, described commits read as momentum.",
     "<b>Use Issues as the roadmap</b> — file the deferred items (GA511 wiring, blur pipeline, WebRTC cut) as issues so the plan is visible.",
     "<b>Add a short CHANGELOG</b> — every dated line is a Build Register entry.",
   ]),
   ("call","THE ONE MOVE ON GITHUB","Ship a v1.0.0 Release with the .exe attached and one Live Board GIF in the README. A stranger should be able to go from ‘what is this’ to ‘I downloaded and ran it’ in under a minute. That single flow is what makes the rest — Reddit, YouTube — have somewhere to send people."),
 ]),

 dict(roman="V", kicker="REDDIT", title="Use Reddit for Feedback and Goodwill",
      sub="Where honest builders get sharp feedback — if they lead with value, not a pitch.",
      accent=HexColor("#FF4500"), blocks=[
   ("lead","Reddit will tell you the truth about your product faster than anyone — and reward you with genuine early users — but only if you show up as a builder sharing something, not a marketer dropping a link. Play it right and it is the best free feedback loop you have."),
   ("h","Where to post"),
   ("bul",[
     "<b>Show-and-tell subs</b> — r/SideProject, r/electronjs, r/opensource: ‘I built a live traffic broadcast dashboard, here’s the Live Board.’",
     "<b>Visual subs</b> — r/dataisbeautiful for the Road Card, when it is backed by real 511 data (not sample).",
     "<b>Local subs</b> — r/Atlanta and Georgia community subs: lead with usefulness to <b>them</b> (‘a cleaner view of Atlanta congestion’), never with self-promo.",
   ]),
   ("h","How to post so it lands"),
   ("bul",[
     "<b>Lead with the visual</b> — a GIF of the Live Board or Traffic Channel does the talking.",
     "<b>Ask one specific question</b> — ‘what would make this useful enough to leave open on a second monitor?’ beats ‘thoughts?’",
     "<b>Respect each sub’s self-promo rules</b> — most expect you to contribute far more than you promote. Read the sidebar first.",
     "<b>Be present in the thread</b> — reply to every comment, thank the harsh ones, and turn each suggestion into a GitHub issue on the spot.",
   ]),
   ("h","Turn feedback into fuel"),
   ("p","Every thread is a backlog. File what people ask for as issues, ship a couple fast, then come back with ‘you asked, I shipped’ — that loop converts a one-time post into a following. Screenshots of ‘before/after your feedback’ are some of the most goodwill-generating content there is."),
   ("call","THE ONE MOVE ON REDDIT","Post the Live Board GIF to one show-and-tell sub with a single honest question and the GitHub link in a comment, not the title. Then answer every reply within the day. One well-run thread is worth more than ten drive-by posts."),
 ]),

 dict(roman="VI", kicker="YOUTUBE", title="Turn the Traffic Into the TM CZAR Channel",
      sub="Point GitHub stars and Reddit threads at YouTube — and launch the network’s voice.",
      accent=HexColor("#E0202E"), blocks=[
   ("lead","The capstone names CZTVN as the empire’s voice — a road-and-mobility news channel, first of a planned eight, benchmarked on calm credentialed authority. Its formal launch is March 29, 2027, but the channel can start <b>now</b> as build-in-public. And you already own the rarest thing a new channel needs: a broadcast tool that is also the story."),
   ("h","Why you are further ahead than a normal channel"),
   ("p","Most new channels have to build content. You have a machine that generates it: the Live Board is an OBS source, the Traffic Channel runs itself, the Road Card is a daily short. The same act — running the dashboard — feeds both the audience and the owned archive. Content engine and data engine are one object."),
   ("h","The funnel — GitHub and Reddit feed YouTube"),
   ("bul",[
     "<b>GitHub README → YouTube</b> — a ‘see it running’ link under the top GIF sends every repo visitor to the channel.",
     "<b>Reddit threads → YouTube</b> — when a thread goes well, ‘full walkthrough here’ converts curiosity into a subscriber.",
     "<b>YouTube → GitHub</b> — every video description points back to the repo release. The loop compounds.",
   ]),
   ("h","The first videos to cut"),
   ("bul",[
     "<b>The build story</b> — ‘I built a live traffic broadcast dashboard with Claude Code’: the honest v1, the .exe, the archive. This is the flagship.",
     "<b>A live traffic broadcast</b> — the Live Board on Atlanta, Traffic Channel rotating, you narrating the corridors. Prove the format.",
     "<b>The Daily Road Card as a Short</b> — one card, one stat, fifteen seconds. Repeatable, dated, on-brand.",
   ]),
   ("h","Set the through-line early"),
   ("p","Name it what it is: The Traffic Motorist Czar Television Network. Frame the channel as build-in-public today, road-and-mobility news at the March 29, 2027 launch. Every video is both content and a dated Build Register line — the audience watches the empire assemble in real time, which is itself the story."),
   ("call","THE ONE MOVE ON YOUTUBE","Publish the build-story video first, link it from the GitHub README and your best Reddit thread the same day, and pin the repo release in the description. That one cross-linked triangle — repo, thread, video — is the whole growth engine in miniature. Everything after is repetition."),
   ("quote","Rented feeds evaporate; owned capture compounds. The channel is how the world watches it happen — and the dashboard is the camera."),
 ]),
]

# ─────────────────────────────────────────────────────────── PDF machinery ──
class Doc:
    def __init__(self, path):
        self.c = canvas.Canvas(path, pagesize=letter)
        self.page = 0
        self.accent = GOLD
        self.kicker = ""
        self.y = CONTENT_TOP

    # -- page frame ---------------------------------------------------------
    def _paper(self):
        self.c.setFillColor(PAPER); self.c.rect(0, 0, PW, PH, fill=1, stroke=0)

    def start_content(self, accent, kicker, title_right):
        self.c.showPage() if self.page else None
        self.page += 1
        self.accent = accent; self.kicker = kicker
        self._paper()
        # top band
        self.c.setFillColor(accent); self.c.rect(0, PH - TOP_BAND, PW, TOP_BAND, fill=1, stroke=0)
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica-Bold", 11)
        self.c.drawString(LM, PH - TOP_BAND + 19, kicker)
        self.c.setFont("Helvetica", 9)
        self.c.drawRightString(PW - RM, PH - TOP_BAND + 19, title_right)
        self._footer()
        self.y = CONTENT_TOP

    def _footer(self):
        self.c.setStrokeColor(self.accent); self.c.setLineWidth(2)
        self.c.line(LM, BOTTOM - 14, LM + 42, BOTTOM - 14)
        self.c.setFillColor(MUTED); self.c.setFont("Helvetica", 7.5)
        self.c.drawString(LM, BOTTOM - 26, "CZTVN DASHBOARD · FIELD PLAYBOOK · GRADE A1")
        self.c.drawRightString(PW - RM, BOTTOM - 26, f"{DOC_ID} · PAGE {self.page}")

    def _newpage_same(self):
        self.start_content(self.accent, self.kicker,
                           f"{DOC_ID}")

    def _room(self, h):
        if self.y + h > PH - BOTTOM:
            self._newpage_same()

    # -- flowables ----------------------------------------------------------
    def draw_para(self, para, gap=8, keep=0):
        w, h = para.wrap(CW, PH)
        self._room(h + keep)
        para.drawOn(self.c, LM, PH - self.y - h)
        self.y += h + gap

    def heading(self, text):
        # keep heading with a bit of its body
        self._room(60)
        # accent tick
        self.c.setFillColor(self.accent)
        self.c.rect(LM, PH - self.y - 12, 5, 15, fill=1, stroke=0)
        p = P(text, S_H)
        w, h = p.wrap(CW - 14, PH)
        p.drawOn(self.c, LM + 14, PH - self.y - h)
        self.y += h + 6

    def bullets(self, items):
        for it in items:
            p = P(it, S_BUL)
            w, h = p.wrap(CW - 18, PH)
            self._room(h + 4)
            # bold accent square
            self.c.setFillColor(self.accent)
            self.c.rect(LM + 2, PH - self.y - 9, 5, 5, fill=1, stroke=0)
            p.drawOn(self.c, LM + 18, PH - self.y - h)
            self.y += h + 6
        self.y += 3

    def callout(self, title, body):
        pad = 14
        tp = P(title, S_CALLT); tw, th = tp.wrap(CW - 2*pad, PH)
        bp = P(body, S_CALLB);  bw, bh = bp.wrap(CW - 2*pad, PH)
        box_h = pad + th + 6 + bh + pad
        self._room(box_h + 10)
        top = PH - self.y
        # tinted fill + bold left bar
        self.c.setFillColor(tint(self.accent, 0.86))
        self.c.roundRect(LM, top - box_h, CW, box_h, 8, fill=1, stroke=0)
        self.c.setFillColor(self.accent)
        self.c.rect(LM, top - box_h, 6, box_h, fill=1, stroke=0)
        # title chip
        self.c.setFillColor(self.accent)
        self.c.roundRect(LM + pad, top - pad - th - 3, tw + 12, th + 6, 3, fill=1, stroke=0)
        tp.drawOn(self.c, LM + pad + 6, top - pad - th)
        bp.drawOn(self.c, LM + pad, top - pad - th - 6 - bh)
        self.y += box_h + 12

    def quote(self, text):
        p = P('“' + text + '”', S_QUOTE)
        w, h = p.wrap(CW - 30, PH)
        self._room(h + 16)
        top = PH - self.y
        self.c.setStrokeColor(self.accent); self.c.setLineWidth(3)
        self.c.line(LM, top - h - 4, LM, top)
        p.drawOn(self.c, LM + 18, PH - self.y - h)
        self.y += h + 14

    # -- special pages ------------------------------------------------------
    def cover(self):
        self.page += 1
        self._paper()
        # bold color stripe of all six section accents
        xs = LM
        band_y = PH - 150
        seg = CW / 6.0
        for s in CONTENT:
            self.c.setFillColor(s["accent"])
            self.c.rect(xs, band_y, seg, 10, fill=1, stroke=0)
            xs += seg
        # presenter
        self.c.setFillColor(GOLD); self.c.setFont("Helvetica-Bold", 11)
        self.c.drawString(LM, band_y - 34, PRESENTER.upper())
        # title
        self.c.setFillColor(INK); self.c.setFont("Helvetica-Bold", 52)
        self.c.drawString(LM, band_y - 92, "The CZTVN")
        self.c.drawString(LM, band_y - 146, "Dashboard")
        # subtitle
        self.c.setFillColor(MUTED); self.c.setFont("Helvetica", 14)
        sp = P(SUBTITLE, style("cs", 14, 19, MUTED))
        w, h = sp.wrap(CW - 120, PH); sp.drawOn(self.c, LM, band_y - 190)
        # action tag row
        self.c.setFont("Helvetica-Bold", 11)
        tags = [("TODAY", CONTENT[0]["accent"]), ("TOMORROW", CONTENT[1]["accent"]),
                ("NEXT WEEK", CONTENT[2]["accent"]), ("GITHUB", CONTENT[3]["accent"]),
                ("REDDIT", CONTENT[4]["accent"]), ("YOUTUBE", CONTENT[5]["accent"])]
        tx = LM; ty = 150
        for label, col in tags:
            tw = self.c.stringWidth(label, "Helvetica-Bold", 11)
            self.c.setFillColor(col)
            self.c.roundRect(tx, ty, tw + 18, 22, 4, fill=1, stroke=0)
            self.c.setFillColor(WHITE); self.c.drawString(tx + 9, ty + 6, label)
            tx += tw + 18 + 8
        # footer id
        self.c.setStrokeColor(GOLD); self.c.setLineWidth(2)
        self.c.line(LM, 96, PW - RM, 96)
        self.c.setFillColor(INK); self.c.setFont("Helvetica-Bold", 10)
        self.c.drawString(LM, 78, DOC_ID)
        self.c.setFillColor(MUTED); self.c.setFont("Helvetica", 10)
        self.c.drawString(LM, 62, f"{DATE_STR}  ·  {PLACE}")
        self.c.drawRightString(PW - RM, 62, ENTITY)

    def contents(self):
        self.c.showPage(); self.page += 1
        self._paper()
        self.c.setFillColor(GOLD); self.c.rect(0, PH - TOP_BAND, PW, TOP_BAND, fill=1, stroke=0)
        self.c.setFillColor(WHITE); self.c.setFont("Helvetica-Bold", 11)
        self.c.drawString(LM, PH - TOP_BAND + 19, "CONTENTS")
        self.c.setFont("Helvetica", 9)
        self.c.drawRightString(PW - RM, PH - TOP_BAND + 19, DOC_ID)
        self.c.setFillColor(INK); self.c.setFont("Helvetica-Bold", 26)
        self.c.drawString(LM, PH - TOP_BAND - 54, "Six moves, in order")
        self.c.setFillColor(MUTED); self.c.setFont("Helvetica", 11)
        self.c.drawString(LM, PH - TOP_BAND - 74,
                          "Today → tomorrow → next week, then the audience: GitHub, Reddit, YouTube.")
        cy = TOP_BAND + 118        # cursor: distance from top
        tstyle = style("tct", 13.5, 16, INK, font="Helvetica-Bold")
        sstyle = style("tsub", 10, 13, MUTED)
        for s in CONTENT:
            top = PH - cy
            # number chip
            self.c.setFillColor(s["accent"])
            self.c.rect(LM, top - 30, 30, 30, fill=1, stroke=0)
            self.c.setFillColor(WHITE); self.c.setFont("Helvetica-Bold", 14)
            self.c.drawCentredString(LM + 15, top - 20, s["roman"])
            # title (wraps if long)
            tp = P(f'{s["kicker"]} — {s["title"]}', tstyle)
            tw, th = tp.wrap(CW - 46, PH)
            tp.drawOn(self.c, LM + 46, top - th)
            # subtitle stacked below the title (wraps)
            sp = P(s["sub"], sstyle)
            sw, sh = sp.wrap(CW - 46, PH)
            sp.drawOn(self.c, LM + 46, top - th - 5 - sh)
            row_h = max(30, th + 5 + sh)
            self.c.setStrokeColor(HAIR); self.c.setLineWidth(0.6)
            self.c.line(LM, top - row_h - 13, PW - RM, top - row_h - 13)
            cy += row_h + 28
        self._footer_static()

    def _footer_static(self):
        self.c.setFillColor(MUTED); self.c.setFont("Helvetica", 7.5)
        self.c.drawString(LM, BOTTOM - 26, "CZTVN DASHBOARD · FIELD PLAYBOOK · GRADE A1")
        self.c.drawRightString(PW - RM, BOTTOM - 26, f"{DOC_ID} · CONTENTS")

    def divider(self, s):
        self.c.showPage(); self.page += 1
        # full-bleed bold accent
        self.c.setFillColor(s["accent"]); self.c.rect(0, 0, PW, PH, fill=1, stroke=0)
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica-Bold", 15)
        self.c.drawString(LM, PH - 120, s["kicker"])
        self.c.setFont("Helvetica-Bold", 200)
        self.c.drawString(LM - 8, PH/2 - 40, s["roman"])
        self.c.setFont("Helvetica-Bold", 30)
        tp = P(s["title"], style("dt", 30, 34, WHITE, font="Helvetica-Bold"))
        w, h = tp.wrap(CW, PH); tp.drawOn(self.c, LM, 200)
        self.c.setFont("Helvetica", 13)
        sp = P(s["sub"], style("ds", 13, 18, WHITE, font="Helvetica-Oblique"))
        w, h = sp.wrap(CW - 60, PH); sp.drawOn(self.c, LM, 150)
        self.c.setStrokeColor(WHITE); self.c.setLineWidth(2)
        self.c.line(LM, 130, LM + 60, 130)

    def render_section(self, s):
        self.divider(s)
        self.start_content(s["accent"], f'{s["roman"]} · {s["kicker"]}', DOC_ID)
        # section title as page opener
        self.heading(s["title"])
        for blk in s["blocks"]:
            k = blk[0]
            if   k == "lead":  self.draw_para(P(blk[1], S_LEAD), gap=10)
            elif k == "p":     self.draw_para(P(blk[1], S_BODY), gap=9)
            elif k == "h":     self.heading(blk[1])
            elif k == "bul":   self.bullets(blk[1])
            elif k == "call":  self.callout(blk[1], blk[2])
            elif k == "quote": self.quote(blk[1])
            elif k == "gap":   self.y += blk[1]

    def closing(self):
        self.c.showPage(); self.page += 1
        self._paper()
        xs = LM; seg = CW / 6.0
        for s in CONTENT:
            self.c.setFillColor(s["accent"]); self.c.rect(xs, PH - 150, seg, 10, fill=1, stroke=0)
            xs += seg
        self.c.setFillColor(INK); self.c.setFont("Helvetica-Bold", 30)
        self.c.drawString(LM, PH - 208, "One machine. Two engines.")
        self.c.setFillColor(MUTED); self.c.setFont("Helvetica", 13)
        for i, line in enumerate([
            "The dashboard performs on camera and banks the data while it does.",
            "Run it today. Deepen it tomorrow. Own it next week.",
            "Then let GitHub, Reddit, and YouTube carry the story.",
        ]):
            self.c.drawString(LM, PH - 242 - i*22, line)
        self.c.setFillColor(GOLD); self.c.setFont("Helvetica-Bold", 12)
        self.c.drawString(LM, 150, "free tools  →  owned tool  →  owned data  →  public standing")
        self.c.setStrokeColor(GOLD); self.c.setLineWidth(2); self.c.line(LM, 128, PW - RM, 128)
        self.c.setFillColor(INK); self.c.setFont("Helvetica-Bold", 10)
        self.c.drawString(LM, 108, "The Traffic Motorist Czar Television Network, Inc.")
        self.c.setFillColor(MUTED); self.c.setFont("Helvetica", 9)
        self.c.drawString(LM, 92, ENTITY)
        self.c.drawString(LM, 78, f"{DOC_ID} · {DATE_STR} · Grade A1")
        self.c.drawString(LM, 62, "Layout prepared with Claude (Anthropic). Strategy and the wager are the operator’s.")

    def build(self):
        self.cover()
        self.contents()
        for s in CONTENT:
            self.render_section(s)
        self.closing()
        self.c.showPage()
        self.c.save()

# ─────────────────────────────────────────────────────────── Markdown out ──
def write_md(path):
    L = []
    L.append(f"# {TITLE}\n")
    L.append(f"**{PRESENTER}**\n")
    L.append(f"*{SUBTITLE}*\n")
    L.append(f"`{DOC_ID}` · {DATE_STR} · {PLACE} · {ENTITY} · Grade A1\n")
    L.append("\n## Contents\n")
    for s in CONTENT:
        L.append(f"- **{s['roman']} · {s['kicker']}** — {s['title']}  \n  _{s['sub']}_")
    L.append("")
    for s in CONTENT:
        L.append(f"\n---\n\n## {s['roman']} · {s['kicker']} — {s['title']}\n")
        L.append(f"*{s['sub']}*\n")
        for blk in s["blocks"]:
            k = blk[0]
            if k in ("lead", "p"):
                L.append(_md(blk[1]) + "\n")
            elif k == "h":
                L.append(f"### {blk[1]}\n")
            elif k == "bul":
                for it in blk[1]:
                    L.append(f"- {_md(it)}")
                L.append("")
            elif k == "call":
                L.append(f"> **{blk[1]}** — {_md(blk[2])}\n")
            elif k == "quote":
                L.append(f"> *“{_md(blk[1])}”*\n")
    L.append("\n---\n")
    L.append("**One machine. Two engines.** Run it today. Deepen it tomorrow. Own it next week — "
             "then let GitHub, Reddit, and YouTube carry the story.\n")
    L.append("`free tools → owned tool → owned data → public standing`\n")
    L.append(f"\n*Layout prepared with Claude (Anthropic). Strategy and the wager are the operator's.*\n")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(L))

def _md(t):
    return t.replace("<b>", "**").replace("</b>", "**")

# ─────────────────────────────────────────────────────────────────── main ──
def main():
    here = os.path.dirname(os.path.abspath(__file__))
    pdf = os.path.join(here, BASENAME + ".pdf")
    md  = os.path.join(here, BASENAME + ".md")
    Doc(pdf).build()
    write_md(md)
    print("wrote", pdf)
    print("wrote", md)

if __name__ == "__main__":
    main()
