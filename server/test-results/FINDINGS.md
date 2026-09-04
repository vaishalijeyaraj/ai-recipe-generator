# Why this project has a feasibility check — the story behind it

Date: September 2026
Model: gemini-3.6-flash

## The question I wanted answered

Before building anything fancy on top of this AI recipe generator, I wanted
real proof of what actually goes wrong when you just call an LLM once and
trust whatever it returns. Not a guess — actual evidence.

## What I did

I wrote 15 deliberately tricky test cases (server/test-cases.js) designed to
try to break the recipe generator in specific ways: ingredients that
conflict with the requested diet (paneer + "vegan", shrimp + "vegetarian"),
tight time limits that are easy to blow past, and serving sizes that need
real math to scale correctly. I ran all 15 against the live app and saved
every response (server/test-results/), so the results are real, not
simulated.

## What I expected to find

Going in, I assumed the model would mess up the obvious cases — keeping
non-vegan ingredients in a "vegan" recipe, that kind of thing.

## What I actually found

14 out of 15 passed cleanly. The model was genuinely good at respecting
dietary rules, scaling servings correctly, and keeping to realistic cook
times. My original assumption was wrong — that's a useful result on its own.

The one case that failed was more interesting than what I was originally
looking for. I asked for a recipe using rice and quinoa, but requested a
keto diet — a real conflict, since both ingredients are too high in carbs
for keto. The model didn't break the diet rule, and it didn't refuse the
request either. It just quietly swapped both ingredients out for
cauliflower rice and hemp seeds, with zero indication that anything had
been changed. If you're the person who typed "rice, quinoa" expecting a
recipe built around those, you'd get a recipe with neither, and no idea why.

## Why this mattered more than a simple bug

This isn't a case of the AI being wrong — it's a case of the AI making a
decision on the user's behalf without telling them. That's a trust problem,
not an accuracy problem, and it's the kind of failure that's easy to miss
if you're only checking "did it break the rules," because technically it
didn't. It just went around the user instead of asking them.

## What I built because of this

A `/check-feasibility` endpoint that runs before any recipe gets generated.
It checks whether the given ingredients realistically fit the requested
diet. If there's a genuine conflict, it doesn't generate a fake recipe and
hope for the best — it stops, explains the conflict in plain language with
real numbers (like "rice has about 45g of carbs per cup, keto needs you
under 20-50g for the whole day"), suggests a specific substitute, and
explains why that substitute works — then lets the user decide whether to
accept the swap or change their diet instead. The user stays in control of
their own recipe instead of the AI quietly deciding for them.

## What this taught me

Testing against real cases before building a fix meant the fix ended up
solving a problem I actually found, instead of a problem I assumed existed.
The dietary-violation check I originally planned to build wouldn't have
caught this at all — it was solving the wrong problem. Running the tests
first changed what I built.