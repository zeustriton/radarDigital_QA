import csv
import json
from collections import defaultdict

# Read CSV file (corrected version)
csv_file = '/home/z/my-project/upload/Radar con Prompt Gemini v1 - Sheet1 v3.csv'
output_file = '/home/z/my-project/public/data/proposals.json'

# Initialize data structures
proposals = []
parties = set()
dimensions = set()
categories = set()
madurez_types = set()

# Read and parse CSV with proper handling of quoted fields
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)

    for row in reader:
        # Clean up the data
        proposal = {
            'id': len(proposals) + 1,
            'partido': row['Partido'].strip(),
            'dimension': row['Dimensión'].strip(),
            'categoria': row['Categoría Tecnológica'].strip(),
            'cita': row['Cita Textual de la Propuesta'].strip().strip('"'),
            'madurez': row['Madurez'].strip()
        }

        # Validate madurez value
        valid_madurez = ['Declarativa', 'Instrumental', 'Normativa/Estructurada', 'Programática']
        if proposal['madurez'] not in valid_madurez:
            print(f"⚠️ Invalid madurez value: '{proposal['madurez']}' for proposal {proposal['id']}")
            # Set to 'Declarativa' as default
            proposal['madurez'] = 'Declarativa'

        proposals.append(proposal)
        parties.add(proposal['partido'])
        dimensions.add(proposal['dimension'])
        categories.add(proposal['categoria'])
        madurez_types.add(proposal['madurez'])

# Convert sets to sorted lists
parties_list = sorted(list(parties))
dimensions_list = sorted(list(dimensions))
categories_list = sorted(list(categories))
madurez_list = sorted(list(madurez_types))

# Calculate party statistics
party_stats = {}
for party in parties_list:
    party_proposals = [p for p in proposals if p['partido'] == party]

    # Count by dimension
    dimension_counts = defaultdict(int)
    for p in party_proposals:
        dimension_counts[p['dimension']] += 1

    # Count by category
    category_counts = defaultdict(int)
    for p in party_proposals:
        category_counts[p['categoria']] += 1

    # Count by madurez
    madurez_counts = defaultdict(int)
    for p in party_proposals:
        madurez_counts[p['madurez']] += 1

    # Calculate average by madurez (assign scores)
    madurez_scores = {
        'Normativa/Estructurada': 5,
        'Programática': 4,
        'Instrumental': 3,
        'Declarativa': 2
    }

    total_score = sum(madurez_scores.get(p['madurez'], 1) for p in party_proposals)
    avg_madurez = total_score / len(party_proposals) if party_proposals else 0

    # Count proposals with mentions of key technologies
    tech_keywords = {
        'IA': ['inteligencia artificial', 'ia', 'ai'],
        'Big Data': ['big data', 'analítica de datos', 'data analytics'],
        'IoT': ['iot', 'internet de las cosas', 'sensores'],
        'Cloud': ['cloud', 'nube', 'computación en la nube'],
        'Blockchain': ['blockchain', 'cadena de bloques'],
        '5G': ['5g'],
        'Robotica': ['robótica', 'robots'],
        'Drones': ['drones'],
        'Digital': ['digital', 'digitalizar', 'digitalización']
    }

    tech_counts = {tech: 0 for tech in tech_keywords.keys()}
    for p in party_proposals:
        text_lower = p['cita'].lower()
        for tech, keywords in tech_keywords.items():
            if any(kw in text_lower for kw in keywords):
                tech_counts[tech] += 1

    party_stats[party] = {
        'total_proposals': len(party_proposals),
        'dimension_counts': dict(dimension_counts),
        'category_counts': dict(category_counts),
        'madurez_counts': dict(madurez_counts),
        'avg_madurez': round(avg_madurez, 2),
        'tech_counts': tech_counts
    }

# Calculate dimension statistics
dimension_stats = {}
for dim in dimensions_list:
    dim_proposals = [p for p in proposals if p['dimension'] == dim]
    party_counts = defaultdict(int)

    for p in dim_proposals:
        party_counts[p['partido']] += 1

    dimension_stats[dim] = {
        'total_proposals': len(dim_proposals),
        'party_counts': dict(party_counts)
    }

# Calculate category statistics
category_stats = {}
for cat in categories_list:
    cat_proposals = [p for p in proposals if p['categoria'] == cat]

    madurez_counts = defaultdict(int)
    for p in cat_proposals:
        madurez_counts[p['madurez']] += 1

    category_stats[cat] = {
        'total_proposals': len(cat_proposals),
        'madurez_counts': dict(madurez_counts)
    }

# Build the final JSON structure
data = {
    'metadata': {
        'total_proposals': len(proposals),
        'total_parties': len(parties_list),
        'total_dimensions': len(dimensions_list),
        'total_categories': len(categories_list),
        'madurez_types': madurez_list,
        'generated_at': '2026'
    },
    'parties': parties_list,
    'dimensions': dimensions_list,
    'categories': categories_list,
    'madurez_types': madurez_list,
    'proposals': proposals,
    'statistics': {
        'by_party': party_stats,
        'by_dimension': dimension_stats,
        'by_category': category_stats
    }
}

# Write to JSON file
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✓ Successfully generated JSON with {len(proposals)} proposals")
print(f"✓ Parties: {len(parties_list)}")
print(f"✓ Dimensions: {len(dimensions_list)}")
print(f"✓ Categories: {len(categories_list)}")
print(f"✓ Madurez types: {madurez_list}")
print(f"✓ Output: {output_file}")
