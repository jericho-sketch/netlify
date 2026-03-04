const Anthropic = require("@anthropic-ai/sdk");

const LIMITS = { title: { min: 50, max: 60 }, meta: { min: 140, max: 160 }, h1: { min: 20, max: 70 } };

const EXAMPLES = {
  "Rivery Park": [
    { url: "https://www.riveryparkapts.com/", title: "The Summit at Rivery Park: Luxury Apartments in Georgetown, TX", meta: "Discover luxury apartments in Georgetown, TX at The Summit at Rivery Park Apartments with studio, 1, 2 & 3 bedroom floor plans & resort-style amenities. Tour now!", h1: "Luxury Apartments in Georgetown, TX" },
    { url: "https://www.riveryparkapts.com/amenities", title: "Amenities & Neighborhood | Pet-Friendly Apartments with Pool & Gym in Georgetown", meta: "Explore luxury amenities at The Summit at Rivery Park Apartments—resort-style pool, fitness center, dog park, garage parking, and lounges in Georgetown, TX.", h1: "Amenities" },
    { url: "https://www.riveryparkapts.com/floorplans/one-bedroom", title: "1 Bedroom Apartments in Georgetown | The Summit at Rivery Park", meta: "Browse 1 bedroom layouts at The Summit at Rivery Park Apartments in Georgetown, TX. View pricing, amenities, and availability in our luxury apartment community.", h1: "1 Bedroom Floor Plans" },
    { url: "https://www.riveryparkapts.com/floorplans/two-bedroom", title: "2 Bedroom Apartments in Georgetown | The Summit at Rivery Park", meta: "Discover 2 bedroom floor plans at The Summit at Rivery Park Apartments in Georgetown, TX. View layouts, pricing, square footage, and current availability.", h1: "2 Bedroom Floor Plans" },
    { url: "https://www.riveryparkapts.com/floorplans", title: "Floor Plans | Studio, 1, 2 & 3 Bedroom Apartments in Georgetown", meta: "View studio, 1, 2 & 3 bedroom floor plans at The Summit at Rivery Park Apartments in Georgetown, TX. Explore layouts, pricing, square footage, and availability.", h1: "Studio, 1, 2 & 3 Bedroom Floor Plans" },
  ],
  "Avita Alamo Heights": [
    { url: "https://www.avitaah.com/", title: "Avita Alamo Heights: Luxury Apartments in San Antonio, TX", meta: "Discover our luxury apartments in San Antonio, TX at Avita Alamo Heights with 1, 2, & 3-bedroom floor plans, a resort-style pool, pet area, & more. Tour Now!", h1: "Luxury Apartments in San Antonio, TX" },
    { url: "https://www.avitaah.com/floorplans", title: "Floor Plans | 1, 2, & 3 Bedroom Apartments in Alamo Heights", meta: "Discover 1, 2, & 3 bedroom luxury apartments at Avita Alamo Heights in San Antonio, TX. Spacious layouts, modern finishes, and top amenities await—tour today!", h1: "1, 2, & 3 Bedroom Floor Plans" },
    { url: "https://www.avitaah.com/floorplans/one-bedroom", title: "1 Bedroom Apartments in San Antonio, TX | Avita Alamo Heights", meta: "Explore 1 bedroom apartments at Avita Alamo Heights in San Antonio, TX, featuring stylish floor plans and luxury amenities. Book your tour today!", h1: "One-Bedroom Floor Plans" },
    { url: "https://www.avitaah.com/floorplans/two-bedroom", title: "2 Bedroom Apartments in San Antonio, TX | Avita Alamo Heights", meta: "Find your perfect 2 bedroom apartments at Avita Alamo Heights in San Antonio, TX. Enjoy modern floor plans, luxury amenities, and easy availability. Tour today!", h1: "Two-Bedroom Floor Plans" },
    { url: "https://www.avitaah.com/amenities", title: "Amenities & Neighborhood | San Antonio Apartments with Clubhouse & Pool", meta: "Enjoy luxury living at Avita Alamo Heights in San Antonio, TX. Resort-style pool, 24-hour fitness center, pet play area, clubhouse & more—discover today!", h1: "Amenities & Neighborhood" },
  ],
  "Muir Lake": [
    { url: "https://www.muir-lake.com/", title: "Muir Lake Apartments: Luxury Apartments in Cedar Park, TX", meta: "Discover luxury apartments in Cedar Park, TX at Muir Lake with 1 & 2 bedroom floor plans, a resort-style pool, fitness center & pet-friendly features. Tour now!", h1: "Luxury Apartments in Cedar Park, TX" },
    { url: "https://www.muir-lake.com/amenities", title: "Amenities & Neighborhood | Pet-Friendly Apartments with Pool & Gym in Cedar Park", meta: "Enjoy the amenities at Muir Lake Apartments—pool, lake views, sauna, steam room, Paw Spa, detached garages, fitness center, and outdoor recreation in Cedar Park, TX.", h1: "Amenities" },
    { url: "https://www.muir-lake.com/floorplans", title: "Floor Plans | 1 & 2 Bedroom Apartments in Cedar Park, TX", meta: "Choose from 1 & 2 bedroom floor plans at Muir Lake Apartments. View pricing, square footage, and availability to find the right apartment for you.", h1: "1 & 2 Bedroom Floor Plans" },
    { url: "https://www.muir-lake.com/floorplans/one-bedroom", title: "1 Bedroom Apartments in Cedar Park TX | Muir Lake Apartments", meta: "Explore 1 bedroom apartments at Muir Lake in Cedar Park, TX. View layouts, amenities, pricing, and availability in our lakeside community.", h1: "1 Bedroom Floor Plans" },
    { url: "https://www.muir-lake.com/floorplans/two-bedroom", title: "2 Bedroom Apartments in Cedar Park TX | Muir Lake Apartments", meta: "Discover 2 bedroom apartments at Muir Lake in Cedar Park, TX. View floor plans, square footage, pricing, and availability today.", h1: "2 Bedroom Floor Plans" },
  ],
};

function buildPrompt(url, keyword) {
  const exampleBlocks = Object.entries(EXAMPLES).map(([prop, exs]) => {
    const exStr = exs.map((e, i) =>
      `Example ${i+1}:\n  URL: ${e.url}\n  H1: ${e.h1}\n  Title: ${e.title}\n  Meta: ${e.meta}`
    ).join("\n\n");
    return `--- ${prop} ---\n${exStr}`;
  }).join("\n\n");

  return `You are an SEO expert specializing in luxury apartment communities. Study the following approved SEO metadata examples from 3 properties. Learn their tone, style, structure, and patterns, then apply them to generate metadata for the new URL.

APPROVED EXAMPLES:
${exampleBlocks}

NOW GENERATE FOR:
URL: ${url}
${keyword ? `Target keyword: ${keyword}` : ""}

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{"title":"...","meta":"...","h1":"..."}

Rules:
- title: ${LIMITS.title.min}–${LIMITS.title.max} characters, include keyword naturally
- meta: ${LIMITS.meta.min}–${LIMITS.meta.max} characters, compelling, include keyword, end with a CTA like "Tour now!" or "View today!"
- h1: ${LIMITS.h1.min}–${LIMITS.h1.max} characters, clear and descriptive, include keyword
- Match the voice and style of the approved examples
- Infer the property name, city, and page type from the URL`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { url, keyword } = JSON.parse(event.body);
    if (!url) return { statusCode: 400, headers, body: JSON.stringify({ error: "URL is required" }) };

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: buildPrompt(url, keyword) }],
    });

    const text = message.content.find(b => b.type === "text")?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return { statusCode: 200, headers, body: JSON.stringify(parsed) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Generation failed" }) };
  }
};
