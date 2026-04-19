"""
Seeds the experiment library with 5 pre-built experiments.
Run once after setting up the database:
    python data/seed.py

Safe to re-run — skips existing entries by document_hash.
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from database import AsyncSessionLocal, engine, Base
from models import ExperimentCache, Experiment, Teacher
from utils.auth import hash_password

SEED_TEACHER = {
    "email": "demo@bina.ke",
    "password": "BinaDemo2026!",
    "school_name": "Bina Demo School",
}

SEED_EXPERIMENTS = [
    {
        "document_hash": "seed_ohms_law_v1",
        "title": "Ohm's Law — Voltage, Current and Resistance",
        "subject": "physics",
        "component_url": "__SEED_PLACEHOLDER__",
        "source_doc_url": "__SEED_PLACEHOLDER__",
        "quiz_json": [
            {
                "question": "Ohm's Law states that voltage equals:",
                "options": ["Current + Resistance", "Current × Resistance", "Current ÷ Resistance", "Resistance ÷ Current"],
                "correct_index": 1,
                "explanation": "V = I × R is the mathematical expression of Ohm's Law."
            },
            {
                "question": "If voltage doubles and resistance stays the same, current will:",
                "options": ["Halve", "Stay the same", "Double", "Quadruple"],
                "correct_index": 2,
                "explanation": "Since I = V/R, doubling V while R stays constant doubles I."
            },
            {
                "question": "The unit of resistance is:",
                "options": ["Volt", "Ampere", "Watt", "Ohm"],
                "correct_index": 3,
                "explanation": "Resistance is measured in Ohms (Ω), named after Georg Simon Ohm."
            },
            {
                "question": "A circuit has V=12V and R=4Ω. What is the current?",
                "options": ["3A", "48A", "8A", "0.33A"],
                "correct_index": 0,
                "explanation": "I = V/R = 12/4 = 3 Amperes."
            },
            {
                "question": "Which instrument measures current in a circuit?",
                "options": ["Voltmeter", "Ammeter", "Ohmmeter", "Galvanometer"],
                "correct_index": 1,
                "explanation": "An ammeter measures electrical current and is connected in series."
            }
        ]
    },
    {
        "document_hash": "seed_acid_base_titration_v1",
        "title": "Acid-Base Titration",
        "subject": "chemistry",
        "component_url": "__SEED_PLACEHOLDER__",
        "source_doc_url": "__SEED_PLACEHOLDER__",
        "quiz_json": [
            {
                "question": "In a titration, the solution of known concentration is called the:",
                "options": ["Analyte", "Indicator", "Titrant", "Precipitate"],
                "correct_index": 2,
                "explanation": "The titrant is the standard solution of known concentration added from the burette."
            },
            {
                "question": "Phenolphthalein indicator turns pink in:",
                "options": ["Acidic solutions", "Neutral solutions", "Alkaline solutions", "Salt solutions"],
                "correct_index": 2,
                "explanation": "Phenolphthalein is colourless in acid and turns pink/magenta in alkaline conditions."
            },
            {
                "question": "The endpoint of a titration is when:",
                "options": ["The burette is empty", "The indicator permanently changes colour", "The solution becomes clear", "Temperature stops changing"],
                "correct_index": 1,
                "explanation": "The endpoint is the point at which the indicator permanently changes colour, signalling neutralisation."
            },
            {
                "question": "If 25 mL of NaOH neutralises 25 mL of HCl, their concentrations are:",
                "options": ["Different", "Equal", "NaOH is double", "HCl is double"],
                "correct_index": 1,
                "explanation": "Equal volumes neutralising each other means equal concentrations (for 1:1 molar ratio reactions)."
            },
            {
                "question": "Which piece of glassware is used to deliver the titrant accurately?",
                "options": ["Beaker", "Conical flask", "Burette", "Measuring cylinder"],
                "correct_index": 2,
                "explanation": "A burette allows precise measurement and delivery of the titrant volume."
            }
        ]
    },
    {
        "document_hash": "seed_simple_pendulum_v1",
        "title": "Simple Pendulum — Period and Length",
        "subject": "physics",
        "component_url": "__SEED_PLACEHOLDER__",
        "source_doc_url": "__SEED_PLACEHOLDER__",
        "quiz_json": [
            {
                "question": "The period of a simple pendulum depends on:",
                "options": ["Mass of the bob", "Amplitude of swing", "Length of the string", "Colour of the bob"],
                "correct_index": 2,
                "explanation": "For small angles, T = 2π√(L/g) — period depends only on length and gravity."
            },
            {
                "question": "If you double the length of a pendulum, the period:",
                "options": ["Doubles", "Halves", "Increases by √2", "Stays the same"],
                "correct_index": 2,
                "explanation": "T ∝ √L, so doubling L multiplies T by √2 ≈ 1.41."
            },
            {
                "question": "One complete oscillation of a pendulum is called:",
                "options": ["Amplitude", "Frequency", "Period", "Displacement"],
                "correct_index": 2,
                "explanation": "The period is the time for one complete back-and-forth oscillation."
            },
            {
                "question": "The value of g (acceleration due to gravity) on Earth is approximately:",
                "options": ["9.8 m/s", "9.8 m/s²", "9.8 N", "9.8 J"],
                "correct_index": 1,
                "explanation": "g = 9.8 m/s² is the standard acceleration due to gravity on Earth's surface."
            },
            {
                "question": "A pendulum with a longer string oscillates:",
                "options": ["Faster", "Slower", "At the same speed", "Only in a vacuum"],
                "correct_index": 1,
                "explanation": "Longer string → larger period → slower oscillation rate."
            }
        ]
    },
    {
        "document_hash": "seed_electrolysis_v1",
        "title": "Electrolysis of Copper Sulphate Solution",
        "subject": "chemistry",
        "component_url": "__SEED_PLACEHOLDER__",
        "source_doc_url": "__SEED_PLACEHOLDER__",
        "quiz_json": [
            {
                "question": "In electrolysis, positive ions move towards the:",
                "options": ["Anode", "Cathode", "Electrolyte", "Switch"],
                "correct_index": 1,
                "explanation": "Positive ions (cations) are attracted to the negative electrode, the cathode."
            },
            {
                "question": "During electrolysis of CuSO₄ with copper electrodes, the anode:",
                "options": ["Gains mass", "Loses mass", "Stays the same", "Dissolves completely"],
                "correct_index": 1,
                "explanation": "Copper from the anode dissolves into solution as Cu²⁺ ions."
            },
            {
                "question": "The substance that conducts electricity in electrolysis is called the:",
                "options": ["Electrode", "Electrolyte", "Anode", "Cathode"],
                "correct_index": 1,
                "explanation": "The electrolyte is the ionic solution or molten salt that conducts electricity."
            },
            {
                "question": "What is deposited at the cathode during electrolysis of CuSO₄?",
                "options": ["Oxygen gas", "Hydrogen gas", "Copper metal", "Sulphur"],
                "correct_index": 2,
                "explanation": "Cu²⁺ ions gain electrons at the cathode to form copper metal: Cu²⁺ + 2e⁻ → Cu."
            },
            {
                "question": "Electrolysis requires which type of current?",
                "options": ["AC (alternating)", "DC (direct)", "Both AC and DC", "No current"],
                "correct_index": 1,
                "explanation": "Direct current (DC) is required so that ions consistently migrate to the same electrode."
            }
        ]
    },
    {
        "document_hash": "seed_refraction_v1",
        "title": "Refraction of Light — Snell's Law",
        "subject": "physics",
        "component_url": "__SEED_PLACEHOLDER__",
        "source_doc_url": "__SEED_PLACEHOLDER__",
        "quiz_json": [
            {
                "question": "Refraction occurs because light changes:",
                "options": ["Colour", "Frequency", "Speed", "Intensity"],
                "correct_index": 2,
                "explanation": "Refraction is caused by the change in speed of light as it moves between media."
            },
            {
                "question": "The angle of incidence is measured from the:",
                "options": ["Surface", "Normal to the surface", "Refracted ray", "Horizontal"],
                "correct_index": 1,
                "explanation": "Both angle of incidence and angle of refraction are measured from the normal (perpendicular) to the surface."
            },
            {
                "question": "When light moves from air into glass, it:",
                "options": ["Speeds up and bends away from normal", "Slows down and bends toward normal", "Maintains speed", "Reflects completely"],
                "correct_index": 1,
                "explanation": "Glass is denser than air, so light slows and bends toward the normal."
            },
            {
                "question": "Snell's Law is expressed as:",
                "options": ["n₁cosθ₁ = n₂cosθ₂", "n₁sinθ₁ = n₂sinθ₂", "n₁tanθ₁ = n₂tanθ₂", "n₁θ₁ = n₂θ₂"],
                "correct_index": 1,
                "explanation": "Snell's Law: n₁sinθ₁ = n₂sinθ₂, where n is the refractive index."
            },
            {
                "question": "Total internal reflection occurs when light travels from:",
                "options": ["Air to glass", "Glass to air beyond the critical angle", "Air to water", "Water to glass"],
                "correct_index": 1,
                "explanation": "TIR occurs when light in a denser medium hits the boundary at an angle greater than the critical angle."
            }
        ]
    }
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Seed demo teacher
        result = await db.execute(
            select(Teacher).where(Teacher.email == SEED_TEACHER["email"])
        )
        teacher = result.scalar_one_or_none()
        if not teacher:
            teacher = Teacher(
                email=SEED_TEACHER["email"],
                hashed_password=hash_password(SEED_TEACHER["password"]),
                school_name=SEED_TEACHER["school_name"],
            )
            db.add(teacher)
            await db.flush()
            print(f"Created demo teacher: {SEED_TEACHER['email']}")
        else:
            print(f"Demo teacher already exists: {SEED_TEACHER['email']}")

        # Seed experiments
        for exp_data in SEED_EXPERIMENTS:
            result = await db.execute(
                select(ExperimentCache).where(
                    ExperimentCache.document_hash == exp_data["document_hash"]
                )
            )
            existing = result.scalar_one_or_none()
            if existing:
                print(f"Skipping (exists): {exp_data['title']}")
                continue

            cache = ExperimentCache(
                document_hash=exp_data["document_hash"],
                title=exp_data["title"],
                subject=exp_data["subject"],
                component_url=exp_data["component_url"],
                source_doc_url=exp_data["source_doc_url"],
                quiz_json=exp_data["quiz_json"],
            )
            db.add(cache)
            await db.flush()

            exp = Experiment(teacher_id=teacher.id, cache_id=cache.id, published=True)
            db.add(exp)

            print(f"Seeded: {exp_data['title']}")

        await db.commit()
        print("\nSeed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
