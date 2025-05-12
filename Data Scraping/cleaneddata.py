# ---
# jupyter:
#   jupytext:
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.17.1
#   kernelspec:
#     display_name: Python [conda env:base] *
#     language: python
#     name: conda-base-py
# ---

# %%

# %%
import requests

url = "https://raw.githubusercontent.com/daivikpurani/LiveLikeALocal/main/Data%20Scraping/output.txt"
response = requests.get(url)

if response.status_code == 200:
    raw_html = response.text
    print("✅ File fetched successfully!")
    print(raw_html[:1000])  # Preview first 1000 chars
else:
    print(f"❌ Failed to fetch file. Status code: {response.status_code}")


# %%
from bs4 import BeautifulSoup
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter

def clean_and_chunk(html_text):
    soup = BeautifulSoup(html_text, "html.parser")
    text = soup.get_text()
    text = re.sub(r'\s+', ' ', text).strip()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", "!", "?"]
    )
    return splitter.split_text(text)

chunks = clean_and_chunk(raw_html)
print(f"✅ Cleaned and split into {len(chunks)} chunks")



# %%
import re

def fully_clean_chunk(chunk):
    seen_lines = set()
    cleaned_lines = []

    for line in chunk.splitlines():
        # Remove any header prefixes like H2:, LI:, P:, URL:
        line = re.sub(r'^\s*(H\d:|LI:|P:|URL:)\s*', '', line).strip()

        # Skip empty or trivial lines
        if not line or re.fullmatch(r'[.,\- ]*', line):
            continue

        # Skip duplicate lines
        if line not in seen_lines:
            seen_lines.add(line)
            cleaned_lines.append(line)

    # Combine cleaned lines into one paragraph
    return ' '.join(cleaned_lines)

# Apply the cleaner to all your chunks
fully_cleaned_chunks = [fully_clean_chunk(chunk) for chunk in chunks]

# Filter out too-short ones
final_chunks = [c for c in fully_cleaned_chunks if len(c.split()) > 20]

# Preview the final cleaned chunks
for i, chunk in enumerate(final_chunks[5:15]):
    print(f"\n--- Final Cleaned Chunk {i+1} ---\n{chunk}")


# %%
CATEGORY_KEYWORDS = {
    "food": ["food", "restaurant", "eats", "dine", "drink", "culinary", "tasting", "brunch", "chefs", "beer", "wine", "bites"],
    "music": ["concert", "band", "dj", "music", "jazz", "live", "performance", "orchestra", "acoustic", "beats", "gig"],
    "family": ["kids", "family", "children", "parents", "craft", "games", "puppet", "art", "storytime", "outdoor"],
    "festival": ["festival", "parade", "carnival", "celebration", "fair", "block party", "street fair"],
    "shopping": ["market", "vendor", "popup", "shopping", "handmade", "boutique", "craft fair", "retail"],
    "cultural": ["heritage", "tradition", "diwali", "chinese new year", "black history", "latino", "asian", "indigenous"],
    "wellness": ["yoga", "meditation", "wellness", "fitness", "hike", "run", "health"],
}


# %%

def tag_chunk(text):
    tags = set()
    text_lower = text.lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                tags.add(category)
                break  # Avoid overcounting keywords in same category

    return list(tags) if tags else ["uncategorized"]



# %%

tagged_chunks = []

for chunk in final_chunks:
    tags = tag_chunk(chunk)
    tagged_chunks.append({
        "text": chunk,
        "tags": tags,
        "metadata": {
            "source": "sfchronicle.com",
            "scraped_date": "2025-05-05",
            "tags": tags
        }
    })


# %%
for i, doc in enumerate(tagged_chunks[:5]):
    print(f"\n--- Tagged Chunk {i+1} ---")
    print("Tags:", doc["tags"])
    print("Content:", doc["text"][:300] + "...")


# %%
