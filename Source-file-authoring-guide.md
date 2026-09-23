# Source File Format — Authoring Guide

This is the syntax for writing `/source` files that feed the splitter tool. Each file
becomes one story or dialogue in the reader.

## File structure

Every source file has two parts, separated by a line of three dashes (`---`):

1. A small metadata header (one `key: value` pair per line)
2. The content itself — one sentence or dialogue line per line

```
title: Clinical Intake - Chest Pain
domain: clinical
level: B1
image: 
---
El paciente tiene {taquicardia|rapid heartbeat} desde ayer. :: The patient has had a rapid heartbeat since yesterday.
Ana: ¿Desde cuándo tiene estos síntomas? :: Since when have you had these symptoms?
```

## The metadata header

| Key      | Required? | Notes |
|----------|-----------|-------|
| `title`  | yes       | Display title for this entry |
| `domain` | yes       | e.g. `general` or `clinical` |
| `level`  | yes       | rough label, e.g. `A2`, `B1`, `B2` |
| `image`  | no        | leave blank for now — filename to add later once illustrated |

## Content lines

Every content line (after the `---`) follows this shape:

```
[Speaker: ]Spanish sentence with optional {word tags} :: Full English translation of the line
```

Three parts, always in this order:

1. **Optional speaker prefix** — `Name: ` at the very start of the line, only for dialogue.
   Leave it off entirely for narration.
2. **The Spanish sentence** — plain text, with `{ }` around any single word or short phrase
   you want to be individually click-to-reveal.
3. **`::`** — always exactly two colons, with a space on each side, separating the Spanish
   from the translation. This must appear once per line.
4. **The English translation** — the full sentence in plain English, no tags needed here.

### Narration example (no speaker)

```
El paciente tiene {taquicardia|rapid heartbeat} desde ayer. :: The patient has had a rapid heartbeat since yesterday.
```

### Dialogue example (with speaker)

```
Ana: ¿Desde cuándo tiene estos síntomas? :: Since when have you had these symptoms?
```

### A line with no word-level tags at all

That's fine — not every line needs one:

```
El médico entró en la sala. :: The doctor entered the room.
```

### A line with more than one tagged word

You can tag as many words/phrases as you want in a single line, just wrap each one separately:

```
El {estetoscopio|stethoscope} reveló un {soplo|heart murmur} leve. :: The stethoscope revealed a slight heart murmur.
```

## The `{word|translation}` tag

- Only tag words worth glossing individually — genuinely difficult vocabulary, not
  everything. Words you already know well don't need a tag; the full-line translation
  already covers them.
- The tag can wrap more than one word if it's a set phrase: `{dolor de pecho|chest pain}`
- **Don't tag proper names** (patient names, place names) — they don't need translating,
  and some Spanish names double as ordinary words (Rosa, Sol, Fe, Paz), which can cause
  mismatches if tagged. Just leave names untagged.

## Things to double check before running a file through the splitter

- [ ] Every content line has exactly one `::`
- [ ] Every `{` has a matching `}` and a `|` inside it
- [ ] Speaker prefixes only appear where you actually mean dialogue
- [ ] The header has `title`, `domain`, and `level` filled in (`image` can stay blank)

## Quick full example

```
title: Pharmacy Pickup
domain: general
level: A2
image: 
---
Marcos entra en la farmacia. :: Marcos walks into the pharmacy.
Marcos: Vengo a recoger una {receta|prescription}. :: I'm here to pick up a prescription.
Farmacéutica: ¿Cuál es su nombre completo? :: What's your full name?
Marcos: Marcos Herrera. :: Marcos Herrera.
Farmacéutica: Aquí tiene. Tómelo con {el estómago lleno|a full stomach}. :: Here you go. Take it on a full stomach.
```