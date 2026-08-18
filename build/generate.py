import sys, os, datetime
sys.path.insert(0, os.path.dirname(__file__))
from jinja2 import Environment, FileSystemLoader
import data as D

HERE = os.path.dirname(__file__)
SITE = os.path.abspath(os.path.join(HERE, '..'))
TPL_DIR = os.path.join(HERE, 'templates')

env = Environment(loader=FileSystemLoader(TPL_DIR), trim_blocks=True, lstrip_blocks=True)

BASE_CTX = dict(
    firm=D.FIRM, nav=D.NAV, stats=D.STATS, milestones=D.MILESTONES,
    philosophy=D.PHILOSOPHY, practice_areas=D.PRACTICE_AREAS, founder=D.FOUNDER,
    team=D.TEAM, offices=D.OFFICES, clients=D.CLIENTS, journal=D.JOURNAL,
    affiliations=D.AFFILIATIONS, events_achievements=D.EVENTS_ACHIEVEMENTS,
    gallery=D.GALLERY,
    data=D, year=datetime.date.today().year,
)

def render(template_name, out_name, extra=None, body_class="no-dark-hero"):
    ctx = dict(BASE_CTX)
    if extra:
        ctx.update(extra)
    ctx.setdefault("body_class", body_class)
    html = env.get_template(template_name).render(**ctx)
    out_path = os.path.join(SITE, out_name)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out_name)

# Home
render("index.html", "index.html",
       {"title": "Advocates & Legal Consultants in Karachi",
        "description": "Adamsons Law Associates — advocates and legal consultants in Civil, Criminal, Corporate Law, Taxation, and Banking, with offices across Sindh."},
       body_class="")

# About
render("about.html", "about.html",
       {"title": "About Us",
        "description": "Learn about Adamsons Law Associates — our philosophy, vision, mission, and the team behind the Firm."})

# Founder
render("founder.html", "founder.html",
       {"title": D.FOUNDER["name"],
        "description": "Full professional profile of Advocate Muhammad Ajmal Solangi, Founder and Senior Partner of Adamsons Law Associates."})

# Practice areas index
render("practice-areas.html", "practice-areas.html",
       {"title": "Practice Areas",
        "description": "Explore the practice areas of Adamsons Law Associates, from constitutional litigation to corporate and banking law."})

# Practice area details
# Explicit, hand-verified mapping (slug -> team slugs) built directly from each
# advocate's own stated practice areas, avoiding false keyword collisions
# (e.g. "Property" [real estate] vs "Intellectual Property").
RELATED_TEAM = {
    "corporate": ["imtiaz-sheikh"],
    "constitutional": ["niyaz-solangi", "shahzana-darya-khan", "adeel-khan"],
    "banking": ["sohail-haider"],
    "criminal": ["adeel-khan", "shahzana-darya-khan"],
    "tax": ["nazakat-ali"],
    "arbitration": ["abdullah"],
    "ip": [],
}
for i, pa in enumerate(D.PRACTICE_AREAS):
    other_areas = [p for p in D.PRACTICE_AREAS if p["slug"] != pa["slug"]]
    wanted = RELATED_TEAM.get(pa["slug"], [])
    related_team = [m for m in D.TEAM if m["slug"] in wanted]
    render("practice-detail.html", pa["file"],
           {"title": pa["title"], "pa": pa, "other_areas": other_areas, "related_team": related_team,
            "description": pa["summary"]})

# Team index
render("team.html", "team.html",
       {"title": "Our Team",
        "description": "Meet the advocates and associates of Adamsons Law Associates."})

# Team profiles
for m in D.TEAM:
    render("team-profile.html", m["file"],
           {"title": m["name"], "m": m,
            "description": m["bio"][:155]})

# Events & Achievements
render("events.html", "events.html",
       {"title": "Events & Achievements",
        "description": "Milestones, Bar leadership, and professional recognition earned by Adamsons Law Associates."})

# Journal
render("journal.html", "journal.html",
       {"title": "Journal",
        "description": "Legal insights and professional recognition from Adamsons Law Associates."})

# Journal detail pages
for j in D.JOURNAL:
    render("journal-detail.html", j["file"],
           {"title": j["title"], "j": j, "journal": D.JOURNAL,
            "description": j["text"][:155]})

# Offices
render("offices.html", "offices.html",
       {"title": "Our Offices",
        "description": "Adamsons Law Associates maintains three offices across Sindh — DHA Karachi, Saddar Karachi, and Ghotki."})

# Contact
render("contact.html", "contact.html",
       {"title": "Contact & Consultation",
        "description": "Schedule a consultation with Adamsons Law Associates or contact any of our three offices directly."})

print("\nDone.")
