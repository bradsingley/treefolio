-- Migration: Seed species data
-- Created: 2026-02-17
-- Description: Populates tf_species with 16 bonsai species, care calendars tuned for the Pacific Northwest.
--
-- Rollback:
--   DELETE FROM tf_species;

INSERT INTO tf_species (scientific_name, common_name, family, care_calendar, climate_zones, indoor_outdoor, difficulty, watering, light, notes)
VALUES

-- 1. Japanese Maple
(
  'Acer palmatum',
  'Japanese Maple',
  'Sapindaceae',
  '{
    "jan": ["dormancy — protect from hard frost below -5°C", "inspect wiring on bare branches", "plan structural pruning"],
    "feb": ["late dormancy — watch for early bud swell in mild PNW winters", "structural pruning before buds open", "order soil and supplies for repotting"],
    "mar": ["repot before buds open — akadama/pumice/lava 2:1:1", "begin light fertilizing after repot recovery (2 weeks)", "watch for late frost"],
    "apr": ["full fertilizing (balanced organic)", "maintenance pruning — cut back to 1–2 leaf pairs", "watch for aphids on new growth"],
    "may": ["pinch new growth to maintain shape", "continue balanced fertilizing every 2 weeks", "increase watering as growth accelerates"],
    "jun": ["defoliation window on healthy trees only — produces smaller second-flush leaves", "pause fertilizing during defoliation recovery", "PNW dry season begins — monitor watering closely"],
    "jul": ["shade from afternoon sun — PNW heat events can scorch leaves", "water daily or twice daily in heat", "pause heavy fertilizing in heat"],
    "aug": ["reduce fertilizer", "maintain watering as PNW dry season continues", "watch for spider mites in dry conditions"],
    "sep": ["resume balanced fertilizing for autumn push", "enjoy fall color developing", "reduce watering as rains return"],
    "oct": ["final fertilizing of the season", "reduce watering — PNW rains usually sufficient", "prepare winter protection"],
    "nov": ["wire after leaf drop for best branch visibility", "clean up fallen leaves to prevent fungal issues", "move to sheltered spot for winter"],
    "dec": ["full dormancy", "protect from hard frost — cold frame or unheated garage if below -5°C", "minimal intervention"]
  }',
  ARRAY[5, 6, 7, 8],
  'outdoor',
  'intermediate',
  'Keep consistently moist — never let roots dry completely. Increase watering during PNW dry summers (Jul–Sep). Reduce in winter when rain is abundant.',
  'Morning sun, afternoon shade. Protect from intense afternoon sun especially during PNW heat events. Dappled light under larger trees is ideal.',
  'Iconic bonsai species. Thrives in PNW climate — mild wet winters and moderate summers suit it well. Protect from occasional hard freezes. Many cultivars available: Deshojo (red spring growth), Kiyohime (dwarf), Shishigashira (lion''s head).'
),

-- 2. Chinese Elm
(
  'Ulmus parvifolia',
  'Chinese Elm',
  'Ulmaceae',
  '{
    "jan": ["dormancy — may retain some leaves in mild PNW winters", "structural pruning on bare branches", "protect from hard frost"],
    "feb": ["watch for early bud break in mild years", "plan repotting", "inspect for scale insects on bark"],
    "mar": ["repot every 2–3 years before bud break", "begin fertilizing after 2 weeks recovery", "standard bonsai mix"],
    "apr": ["vigorous growth begins — prune back to 1–2 leaves when shoots reach 6–8", "full fertilizing every 2 weeks", "watch for elm leaf beetle"],
    "may": ["continue clip-and-grow maintenance", "fertilize every 2 weeks", "excellent ramification with consistent pruning"],
    "jun": ["defoliation option on strong trees", "continue maintenance pruning", "increase watering for PNW dry season"],
    "jul": ["maintain pruning schedule — grows vigorously", "water well during PNW heat", "check wire monthly — fast grower"],
    "aug": ["reduce fertilizer slightly", "continue pruning and watering", "watch for spider mites"],
    "sep": ["resume full fertilizing", "continue maintenance pruning", "growth slows with shorter days"],
    "oct": ["final fertilizer application", "reduce watering as rains return", "autumn color developing"],
    "nov": ["wire bare branches after leaf drop", "clean up debris", "protect from hard frost if semi-evergreen"],
    "dec": ["dormancy", "protect from sustained freezing", "minimal care"]
  }',
  ARRAY[5, 6, 7, 8, 9],
  'outdoor',
  'beginner',
  'Moderate watering — allow top layer to dry slightly between watering. Very forgiving. Reduce in PNW rainy season.',
  'Full sun to partial shade. Very adaptable to PNW light conditions.',
  'Excellent beginner species. Extremely vigorous and forgiving. Responds well to all bonsai techniques. Semi-evergreen in mild PNW winters — may hold leaves through December. Outstanding bark texture develops with age.'
),

-- 3. Juniper
(
  'Juniperus chinensis',
  'Juniper',
  'Cupressaceae',
  '{
    "jan": ["dormancy — keep outdoors, cold-hardy", "inspect deadwood features (jin/shari)", "do not water excessively — wet PNW winters risk root rot"],
    "feb": ["still dormant — plan spring work", "check drainage — PNW rain can waterlog soil", "lime sulfur on deadwood if needed"],
    "mar": ["growth resumes — pinch new growth with fingers only", "ensure free-draining soil", "do not prune with scissors — causes browning"],
    "apr": ["repot every 3–5 years — pumice-heavy fast-draining mix", "begin light fertilizing (low nitrogen)", "pinch extending shoots"],
    "may": ["active pinching of new growth to maintain foliage pads", "light organic fertilizer", "full sun — minimum 6 hours direct"],
    "jun": ["continue pinching — never cut foliage with scissors", "maintain pad structure", "water carefully — junipers prefer drier conditions"],
    "jul": ["mist foliage during PNW heat events", "water when soil surface is dry", "do not overwater — #1 killer of junipers"],
    "aug": ["reduce fertilizer", "continue pinching maintenance", "watch for spider mites in dry weather"],
    "sep": ["resume light fertilizing", "evaluate branch structure", "begin planning autumn wiring"],
    "oct": ["wire for structure — branches are flexible in fall", "reduce watering as rains return", "final fertilizer"],
    "nov": ["finish wiring work", "create or refine deadwood features", "protect pot from waterlogging in heavy PNW rain"],
    "dec": ["dormancy — cold-hardy, keep outdoors", "ensure drainage in winter rain", "minimal intervention"]
  }',
  ARRAY[4, 5, 6, 7, 8, 9],
  'outdoor',
  'beginner',
  'Allow soil to dry slightly between watering. Overwatering is the #1 killer. In PNW wet winters, ensure excellent drainage and tilt pots to shed excess rain.',
  'Full sun — minimum 6 hours direct sunlight. PNW cloud cover can be a challenge; place in the sunniest available spot.',
  'Classic bonsai species. Includes J. chinensis, J. procumbens nana, J. rigida, and others. Pinch new growth — NEVER cut with scissors. Deadwood carving (jin and shari) is a hallmark feature. PNW wet winters demand fast-draining soil and careful watering. Extremely cold-hardy.'
),

-- 4. Mountain Hemlock
(
  'Tsuga mertensiana',
  'Mountain Hemlock',
  'Pinaceae',
  '{
    "jan": ["dormancy — cold-hardy native, keep outdoors", "inspect for winter damage", "protect from desiccating east winds"],
    "feb": ["late dormancy — buds beginning to swell", "plan repotting if needed", "ensure good drainage"],
    "mar": ["repot every 3–4 years in fast-draining mix with pumice", "gentle root work — hemlocks resent heavy root pruning", "begin light fertilizing"],
    "apr": ["new candles extending — allow to elongate before pinching", "balanced organic fertilizer", "keep consistently moist"],
    "may": ["pinch candles back by half to control growth", "maintain even moisture — hemlocks do not tolerate drought", "fertilize every 2–3 weeks"],
    "jun": ["continue pinching new growth", "increase watering as PNW dry season begins", "afternoon shade appreciated in heat"],
    "jul": ["critical watering period — hemlocks suffer in PNW summer heat", "mist foliage regularly", "shade from afternoon sun"],
    "aug": ["continue vigilant watering", "reduce fertilizer", "watch for spider mites and adelgids"],
    "sep": ["resume fertilizing", "growth slows — reduce pinching", "natural rainfall returns"],
    "oct": ["final fertilizer application", "evaluate structure for wiring", "reduce supplemental watering"],
    "nov": ["wire for structure if needed", "protect from desiccating wind", "clean up debris"],
    "dec": ["full dormancy — very cold-hardy", "keep outdoors", "ensure pots do not waterlog"]
  }',
  ARRAY[4, 5, 6, 7],
  'outdoor',
  'advanced',
  'Keep consistently moist at all times — hemlocks do not tolerate drought. Mist foliage in dry weather. Ensure good drainage to prevent root rot in PNW wet winters.',
  'Prefers partial shade or filtered light, especially afternoon shade. Mimics its natural subalpine habitat. Avoid full afternoon sun in PNW summer.',
  'Native PNW subalpine conifer. Elegant drooping habit with short needles. Collected specimens (yamadori) can be spectacular. Challenging as bonsai — demands consistent moisture and cool conditions. Naturally grows at elevation; struggles with lowland summer heat. Adelgid pests can be problematic.'
),

-- 5. Sitka Spruce
(
  'Picea sitchensis',
  'Sitka Spruce',
  'Pinaceae',
  '{
    "jan": ["dormancy — very cold-hardy PNW native", "inspect for structure and wiring", "protect from prolonged hard frost on pot"],
    "feb": ["late dormancy — buds swelling", "plan spring repotting", "sharp needles — wear gloves"],
    "mar": ["repot every 3–4 years — pumice/akadama/lava mix", "new buds about to break", "begin light fertilizing after repotting recovery"],
    "apr": ["candles extending — let them elongate fully", "balanced fertilizer every 2–3 weeks", "keep evenly moist"],
    "may": ["pinch or cut new candles back by half to one-third", "vigorous growth — fertilize regularly", "full sun for compact growth"],
    "jun": ["continue pinching extending growth", "increase watering for PNW dry season", "remove downward-growing needles from branches"],
    "jul": ["water consistently — spruces need regular moisture", "mist foliage in heat", "watch for spider mites and aphids"],
    "aug": ["reduce fertilizer", "maintain watering", "late-season needle cleanup on interior branches"],
    "sep": ["resume fertilizing for autumn hardening", "evaluate branching for fall wiring", "natural rainfall returning"],
    "oct": ["final fertilizer", "wire for structure — branches flexible in fall", "reduce supplemental watering"],
    "nov": ["continue wiring work", "clean up interior dead needles", "protect pot from waterlogging"],
    "dec": ["full dormancy", "cold-hardy — keep outdoors", "minimal care"]
  }',
  ARRAY[6, 7, 8],
  'outdoor',
  'intermediate',
  'Keep evenly moist — spruces need consistent water. Do not let roots dry out. Ensure good drainage in PNW winter rains.',
  'Full sun for compact growth. Tolerates PNW overcast conditions well — native coastal species.',
  'Iconic PNW coastal native — the largest spruce species in the world. Sharp, stiff needles (wear gloves). Responds well to pinching and candle reduction. Develops interesting bark and deadwood with age. Collected specimens from coastal areas have tremendous character. Naturally wind-sculpted trees make excellent windswept (fukinagashi) bonsai.'
),

-- 6. Western Larch
(
  'Larix occidentalis',
  'Western Larch',
  'Pinaceae',
  '{
    "jan": ["full dormancy — leafless deciduous conifer", "excellent time to evaluate and wire bare structure", "very cold-hardy, keep outdoors"],
    "feb": ["late dormancy — buds beginning to swell with green", "structural pruning on bare branches", "plan repotting"],
    "mar": ["repot every 2–3 years before buds break — well-draining pumice mix", "soft green needles emerging — spectacular spring display", "begin fertilizing after repot recovery"],
    "apr": ["fresh needles fully emerged — bright spring green", "balanced fertilizer every 2 weeks", "pinch extending shoots to maintain shape"],
    "may": ["vigorous spring growth — pinch back new shoots", "continue regular fertilizing", "full sun essential"],
    "jun": ["growth stabilizing — maintenance pinching", "increase watering for PNW dry season", "healthy green foliage"],
    "jul": ["water well during PNW heat — larches need consistent moisture", "full sun", "watch for larch casebearer moth"],
    "aug": ["reduce fertilizer slightly", "maintain watering through PNW dry summer", "foliage may yellow in extreme heat"],
    "sep": ["resume full fertilizing for autumn push", "spectacular golden fall color beginning", "enjoy the display"],
    "oct": ["brilliant gold needles — peak autumn color", "final fertilizer", "reduce watering as rains return"],
    "nov": ["needles dropping — normal for deciduous conifer", "wire bare branches after needle drop", "structural work on leafless tree"],
    "dec": ["full dormancy — bare branches", "cold-hardy, keep outdoors", "admire winter silhouette"]
  }',
  ARRAY[3, 4, 5, 6, 7],
  'outdoor',
  'intermediate',
  'Keep consistently moist during growing season. Deciduous conifers need reliable water. Do not let roots dry out in PNW summer. Reduce in winter when dormant.',
  'Full sun — requires maximum light. Naturally grows in open, sunny mountain environments. PNW lowland gardens provide enough light.',
  'Stunning deciduous conifer native to the inland PNW mountains. Drops all needles in autumn after spectacular golden display — this is normal, not a sign of trouble. Fresh spring green is equally beautiful. Tallest larch species. Fast-growing and vigorous. Wire in winter when bare for precise structural work.'
),

-- 7. Japanese Larch
(
  'Larix kaempferi',
  'Japanese Larch',
  'Pinaceae',
  '{
    "jan": ["full dormancy — leafless, wire bare branches", "evaluate structure and movement", "cold-hardy, keep outdoors"],
    "feb": ["dormancy ending — buds swelling with bright green", "finish structural pruning and wiring", "plan repotting"],
    "mar": ["repot every 2–3 years before buds open — pumice-heavy mix", "spectacular spring bud break — chartreuse rosettes", "begin gentle fertilizing after repot"],
    "apr": ["rapid growth of soft needles", "balanced fertilizer every 2 weeks", "pinch back new shoots to maintain shape"],
    "may": ["continue pinch-pruning new growth", "vigorous feeder — maintain fertilizer schedule", "full sun"],
    "jun": ["growth stabilizing — maintenance pinching", "increase watering for PNW dry season", "remove unwanted interior growth"],
    "jul": ["water regularly through PNW heat", "mist foliage in extreme heat", "full sun"],
    "aug": ["reduce fertilizer", "maintain watering", "watch for larch casebearer"],
    "sep": ["resume full fertilizing for autumn hardening", "fall color beginning — golden yellow", "growth slowing"],
    "oct": ["spectacular golden fall color", "final fertilizer of season", "enjoy the display before needle drop"],
    "nov": ["needles dropping — wire bare structure", "structural refinement on leafless tree", "clean up fallen needles"],
    "dec": ["full dormancy — bare silhouette", "cold-hardy, keep outdoors", "minimal intervention"]
  }',
  ARRAY[4, 5, 6, 7, 8],
  'outdoor',
  'intermediate',
  'Keep consistently moist during growing season. Does not tolerate drought. Reduce watering in dormancy but do not let roots dry out completely.',
  'Full sun. Needs maximum light for compact growth and good fall color.',
  'Popular deciduous conifer for bonsai. Faster-growing and more forgiving than Western Larch. Stunning spring and autumn displays. Develops interesting bark texture. Excellent for group/forest (yose-ue) plantings. Well-suited to PNW climate — similar conditions to its native Japanese mountain habitat.'
),

-- 8. Japanese Black Pine
(
  'Pinus thunbergii',
  'Japanese Black Pine',
  'Pinaceae',
  '{
    "jan": ["dormancy — plan spring candle work", "cold-hardy in PNW, keep outdoors", "inspect for structure"],
    "feb": ["late dormancy — buds starting to swell", "prepare for spring candle season", "do not prune yet"],
    "mar": ["buds extending into candles", "repot every 3–5 years — pumice-heavy mix, keep some old soil for mycorrhizae", "begin light fertilizing after repot"],
    "apr": ["candles elongating — do NOT cut yet, let them extend fully", "balanced fertilizer", "watch for scale and adelgids"],
    "may": ["candle cutting time — cut strong candles completely, leave weak candles", "this balances energy across the tree", "fertilize to support recovery"],
    "jun": ["second-flush candles emerging from cut sites", "continue fertilizing", "increase watering for PNW dry season"],
    "jul": ["new candles developing — do not disturb", "water well in PNW heat", "full sun — the more the better"],
    "aug": ["second flush hardening off", "reduce fertilizer slightly", "maintain watering"],
    "sep": ["needle pulling — remove old needles to balance energy and allow light to interior", "heavy autumn fertilizing begins (high nitrogen)", "growth slowing"],
    "oct": ["continue needle pulling", "heavy fertilizing — builds strength for spring", "final needles of season set"],
    "nov": ["wire for structure — branches are flexible", "continue autumn feeding", "cold-hardy in PNW"],
    "dec": ["dormancy — stop fertilizing", "keep outdoors", "admire winter form"]
  }',
  ARRAY[5, 6, 7, 8, 9],
  'outdoor',
  'advanced',
  'Moderate watering — good drainage essential. Do not overwater. PNW winter rain requires excellent soil drainage. Allow soil to approach dryness between watering in growing season.',
  'Full sun — the more the better. Needs maximum light for short needles and compact growth. PNW overcast can be challenging.',
  'The most revered pine for bonsai. Candle pruning technique is essential — cut strong candles in late spring to produce shorter second-flush needles. Needle pulling in autumn balances tree energy. Heavy autumn fertilizing is critical. Requires patience and advanced technique. PNW provides adequate cold for dormancy.'
),

-- 9. Japanese Snowbell
(
  'Styrax japonicus',
  'Japanese Snowbell',
  'Styracaceae',
  '{
    "jan": ["dormancy — evaluate bare branch structure", "plan structural pruning", "cold-hardy in PNW, keep outdoors"],
    "feb": ["late dormancy — buds beginning to swell", "structural pruning before bud break", "plan repotting if needed"],
    "mar": ["repot every 2–3 years before leaves emerge — standard bonsai mix with good drainage", "begin light fertilizing after repot recovery", "buds breaking"],
    "apr": ["leaves and flower buds emerging", "balanced fertilizer every 2 weeks", "protect from late frost which can damage flower buds"],
    "may": ["beautiful pendulous white bell-shaped flowers", "enjoy flowering — do not prune during bloom", "continue fertilizing lightly"],
    "jun": ["prune immediately after flowering finishes", "cut back to 1–2 leaf pairs on new growth", "increase watering for PNW dry season"],
    "jul": ["maintenance pruning as needed", "water well during PNW heat — prefers consistent moisture", "partial shade in extreme heat"],
    "aug": ["reduce fertilizer", "maintain watering", "small olive-like fruits forming"],
    "sep": ["resume fertilizing for autumn hardening", "fall color developing — yellow", "growth slowing"],
    "oct": ["final fertilizer", "enjoy fall color", "reduce supplemental watering as rains return"],
    "nov": ["leaves dropping — wire bare branches for structure", "clean up fallen leaves", "protect from hard frost below -10°C"],
    "dec": ["full dormancy", "cold-hardy in most PNW areas", "admire graceful bare branching"]
  }',
  ARRAY[5, 6, 7, 8],
  'outdoor',
  'intermediate',
  'Keep consistently moist — does not tolerate drought. Well-suited to PNW natural rainfall patterns. Supplement watering in dry summer months.',
  'Partial shade to full sun. Appreciates afternoon shade in PNW summer heat. Understory tree in nature — tolerates lower light well.',
  'Elegant deciduous tree prized for its pendulous white bell-shaped flowers in late spring. Graceful branching structure visible in winter. Naturally small-leaved with good proportions for bonsai. PNW climate is ideal — adequate winter chill for flowering with mild enough conditions to avoid flower bud damage. Develops attractive gray bark with age.'
),

-- 10. Japanese White Pine
(
  'Pinus parviflora',
  'Japanese White Pine',
  'Pinaceae',
  '{
    "jan": ["dormancy — cold-hardy, keep outdoors", "inspect wiring", "plan spring work"],
    "feb": ["late dormancy — buds beginning to swell", "evaluate candle positions", "do not prune"],
    "mar": ["repot every 4–5 years — very well-draining pumice mix, keep mycorrhizal soil", "handle roots gently — white pines resent heavy root work", "begin light fertilizing after repot"],
    "apr": ["candles extending — let them grow", "light balanced fertilizer — do not overfeed", "full sun"],
    "may": ["pinch candles back by one-third to one-half when fully extended", "do NOT use candle cutting technique (that is for black pines)", "gentle fertilizing"],
    "jun": ["remove old needles if crowded — leave 5–7 needle bundles per shoot", "increase watering slightly for PNW dry season", "do not overfeed — white pines are slow growers"],
    "jul": ["water moderately — white pines prefer slightly drier conditions than other species", "full sun", "mist in extreme PNW heat"],
    "aug": ["reduce fertilizer", "maintain moderate watering", "inspect for adelgids"],
    "sep": ["light fertilizing for autumn", "needle pulling if needed — balance energy", "growth minimal"],
    "oct": ["final light fertilizer", "wire for structure", "old needles yellowing and dropping naturally"],
    "nov": ["continue wiring on bare areas", "protect from waterlogging in PNW winter rain — excellent drainage critical", "cold-hardy"],
    "dec": ["dormancy", "keep outdoors", "ensure drainage — tilt pots if needed in heavy rain"]
  }',
  ARRAY[5, 6, 7, 8],
  'outdoor',
  'advanced',
  'Moderate watering — prefers slightly drier conditions than most pines. Do not overwater. PNW winter rain demands exceptional drainage. Allow soil to dry between waterings.',
  'Full sun. Needs maximum light. Blue-green five-needle bundles are distinctive.',
  'Prized five-needle pine for bonsai. Often grafted onto black pine rootstock. Much slower growing than black pine — patience is essential. Do NOT use black pine candle-cutting technique. Pinch candles instead. Beautiful blue-green foliage in five-needle bundles. Develops elegant, refined silhouette. PNW winter wet is the main challenge — must have excellent drainage.'
),

-- 11. Trident Maple
(
  'Acer buergerianum',
  'Trident Maple',
  'Sapindaceae',
  '{
    "jan": ["dormancy — evaluate bare structure", "root pruning planning — vigorous roots need attention", "cold-hardy in PNW"],
    "feb": ["structural pruning on bare branches", "prepare for early spring repotting", "buds swelling"],
    "mar": ["repot every 1–2 years — extremely vigorous roots, bare-root OK", "standard bonsai mix — akadama/pumice", "begin fertilizing after 2 weeks recovery"],
    "apr": ["explosive spring growth", "heavy balanced fertilizer every 2 weeks — vigorous feeder", "prune back to 1–2 leaves when shoots reach 4–6"],
    "may": ["clip-and-grow — constant pruning drives ramification", "continue heavy fertilizing", "keep well-watered — vigorous drinker"],
    "jun": ["defoliation window — excellent candidate, can defoliate twice on strong trees", "smaller second-flush leaves develop", "increase watering for PNW dry season"],
    "jul": ["maintain pruning and watering", "water heavily in PNW summer heat", "second defoliation possible on very vigorous trees"],
    "aug": ["reduce fertilizer slightly", "continue watering and maintenance pruning", "watch for aphids"],
    "sep": ["resume heavy fertilizing for autumn push", "enjoy fall color — orange and red", "growth slowing"],
    "oct": ["final heavy fertilizer", "beautiful autumn color", "reduce supplemental watering"],
    "nov": ["wire bare branches after leaf drop", "root pruning possible in mild PNW autumns", "clean up debris"],
    "dec": ["dormancy — more frost-tolerant than Japanese maple", "keep outdoors", "admire winter trunk and nebari"]
  }',
  ARRAY[5, 6, 7, 8, 9],
  'outdoor',
  'intermediate',
  'Vigorous drinker — keep consistently moist, especially in PNW summer. May need twice-daily watering in heat. Very drought-tolerant once established but performs best with consistent moisture.',
  'Full sun. Tolerates some afternoon shade. More sun-tolerant than Japanese maple.',
  'Vigorous deciduous maple. Excellent for developing nebari (root flare) due to aggressive root growth. Repot frequently — roots fill pots quickly. Defoliates beautifully, even twice per season on strong trees. More cold-hardy and sun-tolerant than Japanese maple. Develops outstanding trunk taper quickly. Three-lobed leaves reduce well.'
),

-- 12. Azalea
(
  'Rhododendron indicum',
  'Satsuki Azalea',
  'Ericaceae',
  '{
    "jan": ["dormancy — protect from hard frost below -3°C", "flower buds visible on branch tips — do not prune", "PNW rain suits moisture needs well"],
    "feb": ["dormancy continuing — buds swelling slightly", "do not prune — flower buds are set", "plan post-bloom pruning"],
    "mar": ["buds swelling — approaching bloom season", "begin light acid fertilizer (azalea-specific)", "repot every 2–3 years after flowering — use kanuma soil exclusively"],
    "apr": ["flower buds fattening — approaching bloom", "light acid fertilizer", "keep evenly moist"],
    "may": ["spectacular flowering — enjoy the display!", "do NOT prune until flowering is completely finished", "keep moist and protected from hot sun"],
    "jun": ["prune immediately after last flowers drop — this is your window", "flowers set on THIS year''s growth for NEXT year", "repot now if needed — kanuma soil, gentle root work"],
    "jul": ["new growth setting flower buds for next year", "water with rainwater or acidified water — hates alkaline PNW tap water", "afternoon shade in heat"],
    "aug": ["do not prune — flower buds are forming", "maintain consistent moisture", "reduce fertilizer"],
    "sep": ["light acid fertilizer", "flower buds hardening for next spring", "PNW rain returning — suits azaleas well"],
    "oct": ["final fertilizer", "stop pruning — buds are set", "reduce supplemental watering"],
    "nov": ["semi-evergreen — may retain most leaves in mild PNW winters", "protect from hard frost", "wire carefully with raffia protection — branches are brittle"],
    "dec": ["dormancy — protect from sustained freezing", "cold frame or sheltered spot", "do not disturb"]
  }',
  ARRAY[5, 6, 7, 8],
  'outdoor',
  'intermediate',
  'Keep constantly moist — never let dry out. Use rainwater or acidified water — very sensitive to alkaline PNW municipal water. Kanuma soil retains perfect moisture balance.',
  'Bright indirect light or dappled shade. Protect from intense afternoon sun. Morning sun ideal.',
  'Satsuki azaleas are the premier flowering bonsai. Spectacular blooms in May–June with hundreds of cultivar varieties. CRITICAL: Only prune immediately after flowering — pruning at any other time removes next year''s flower buds. Use kanuma (acidic volcanic soil) exclusively. PNW acidic soil and rainfall suit azaleas well, but watch for alkaline tap water.'
),

-- 13. Dawn Redwood
(
  'Metasequoia glyptostroboides',
  'Dawn Redwood',
  'Cupressaceae',
  '{
    "jan": ["dormancy — leafless deciduous conifer", "structural work on bare branches", "cold-hardy, keep outdoors"],
    "feb": ["late dormancy — buds just starting", "structural pruning and wiring on bare tree", "plan repotting"],
    "mar": ["repot every 2–3 years before bud break — standard bonsai mix with organic matter", "feathery green foliage emerging — stunning spring display", "begin fertilizing after repot recovery"],
    "apr": ["rapid growth of delicate feathery foliage", "balanced fertilizer every 2 weeks — vigorous feeder", "clip new shoots to maintain shape"],
    "may": ["continue clip-and-grow — fast grower", "heavy fertilizing", "keep very well watered — naturally a swamp-edge tree"],
    "jun": ["pinch or clip extending shoots", "increase watering significantly for PNW dry season", "can sit in shallow water tray — loves moisture"],
    "jul": ["water heavily — dawn redwoods are moisture-loving", "sits in water tray perfectly happily", "full sun"],
    "aug": ["reduce fertilizer slightly", "maintain heavy watering", "foliage lush and green"],
    "sep": ["resume full fertilizing", "fall color beginning — copper, bronze, russet", "spectacular autumn display"],
    "oct": ["brilliant russet-bronze fall color", "final fertilizer", "one of the best fall color displays"],
    "nov": ["needles dropping — normal deciduous conifer", "wire bare structure after needle drop", "excellent trunk taper visible"],
    "dec": ["full dormancy — bare trunk with buttressed base", "cold-hardy, keep outdoors", "admire trunk and branch structure"]
  }',
  ARRAY[5, 6, 7, 8, 9],
  'outdoor',
  'beginner',
  'Loves water — naturally grows near streams and swamps. Can sit in a shallow water tray. Water heavily, especially during PNW dry summer. Very hard to overwater.',
  'Full sun. Tolerates partial shade but best color and growth in full sun.',
  'Living fossil — deciduous conifer once thought extinct, rediscovered in 1941 in China. Fast-growing with beautiful feathery foliage. Stunning autumn display in copper-bronze tones. Develops impressive buttressed trunk base quickly. Excellent for beginners — very forgiving and fast to develop. Loves PNW moisture. Often grown as forest (yose-ue) plantings.'
),

-- 14. Ginkgo
(
  'Ginkgo biloba',
  'Ginkgo',
  'Ginkgoaceae',
  '{
    "jan": ["dormancy — evaluate bare structure", "unique fan-shaped leaf scars visible", "cold-hardy, keep outdoors"],
    "feb": ["late dormancy — buds compact and pointed", "structural pruning — cut back to spurs", "plan repotting"],
    "mar": ["repot every 2–3 years before bud break — standard well-draining mix", "buds breaking — bright green fan leaves emerging", "begin fertilizing after repot recovery"],
    "apr": ["distinctive fan-shaped leaves unfurling", "balanced fertilizer every 2 weeks", "grow long shoots, then cut back to 1–2 leaves to build taper"],
    "may": ["allow sacrifice branches to run if building trunk", "clip-and-grow for refinement", "full sun for compact growth"],
    "jun": ["maintenance pruning — keep compact", "increase watering for PNW dry season", "grow and clip technique"],
    "jul": ["water consistently through PNW heat", "full sun", "ginkgos are surprisingly heat-tolerant"],
    "aug": ["reduce fertilizer", "maintain watering", "straight trunk — formal upright (chokkan) is the classic style"],
    "sep": ["resume fertilizing for autumn push", "spectacular golden fall color beginning", "one of the purest yellows in nature"],
    "oct": ["blazing golden yellow — peak fall color", "leaves drop all at once (abscission layer)", "final fertilizer"],
    "nov": ["leaves have dropped — wire bare structure", "unique branching pattern visible", "cold-hardy"],
    "dec": ["full dormancy", "keep outdoors", "planning and appreciation"]
  }',
  ARRAY[3, 4, 5, 6, 7, 8, 9],
  'outdoor',
  'beginner',
  'Moderate watering — tolerates both moisture and brief dry spells. Very adaptable. Keep consistent during PNW dry summer.',
  'Full sun for best growth and fall color. Tolerates partial shade.',
  'Ancient species — 200+ million years old, predates dinosaurs. Distinctive fan-shaped leaves turn pure gold in autumn before dropping all at once. Very few pests or diseases. Traditionally grown in formal upright (chokkan) style. Develop trunk through grow-and-cut technique — allow sacrifice branches to run, then cut back hard. Male trees preferred (female fruit smells terrible). Extremely cold-hardy and adaptable.'
),

-- 15. Dogwood
(
  'Cornus kousa',
  'Japanese Dogwood',
  'Cornaceae',
  '{
    "jan": ["dormancy — evaluate bare branch structure", "distinctive horizontal branching visible", "cold-hardy in PNW"],
    "feb": ["late dormancy — flower buds visible (larger, rounder than leaf buds)", "plan repotting", "structural pruning if needed"],
    "mar": ["repot every 2–3 years before bud break — well-draining slightly acidic mix", "buds breaking", "begin light fertilizing after repot recovery"],
    "apr": ["leaves emerging — attractive layered branching", "balanced fertilizer every 2–3 weeks", "protect from late frost"],
    "may": ["flower bracts appearing — white (or pink) four-pointed stars", "do not prune during flowering", "keep evenly moist"],
    "jun": ["flowering finishing — can prune after bracts drop", "prune to enhance horizontal layering habit", "increase watering for PNW dry season"],
    "jul": ["maintenance pruning to maintain layered form", "water consistently — does not tolerate drought", "partial shade in extreme PNW heat"],
    "aug": ["reduce fertilizer", "small raspberry-like fruits forming (edible)", "maintain watering"],
    "sep": ["resume light fertilizing", "outstanding burgundy-red fall color beginning", "fruits maturing"],
    "oct": ["spectacular red-purple fall color", "final fertilizer", "one of the best fall displays"],
    "nov": ["leaves dropping — attractive exfoliating bark visible", "wire for structure on bare branches", "interesting mottled bark pattern"],
    "dec": ["dormancy — cold-hardy", "keep outdoors", "admire bark and branch structure"]
  }',
  ARRAY[5, 6, 7, 8, 9],
  'outdoor',
  'intermediate',
  'Keep consistently moist — does not tolerate drought. Mulch roots if possible. Consistent PNW summer watering essential.',
  'Partial shade to full sun. Appreciates afternoon shade in PNW heat events. An understory tree in nature.',
  'Elegant tree with distinctive horizontal layered branching. White or pink flower bracts in late spring, followed by edible fruits. Outstanding multi-season interest: flowers, summer foliage, fall color, exfoliating bark. Cornus kousa preferred over C. florida for PNW — resistant to anthracnose disease. Natural layered habit is perfect for bonsai without much styling intervention.'
),

-- 16. Crabapple
(
  'Malus floribunda',
  'Crabapple',
  'Rosaceae',
  '{
    "jan": ["dormancy — evaluate bare structure", "fruiting spurs visible on branches", "cold-hardy, keep outdoors"],
    "feb": ["late dormancy — buds beginning to swell", "structural pruning — maintain compact form", "plan repotting"],
    "mar": ["repot every 2–3 years before bud break — standard well-draining bonsai mix", "buds about to burst — pink buds visible", "begin fertilizing after repot recovery"],
    "apr": ["profuse flowering — pink buds open to white blossoms", "do NOT prune during bloom — enjoy the display", "bees will visit — great pollinator tree", "balanced fertilizer"],
    "may": ["prune after flowering finishes — cut back to 2–3 leaves", "fertilize every 2 weeks", "tiny fruitlets forming if pollinated"],
    "jun": ["thin fruit if too many set — remove some to prevent branch stress", "maintenance pruning — shape and refine", "increase watering for PNW dry season"],
    "jul": ["fruits developing — small ornamental crabapples", "water consistently through PNW heat", "watch for apple scab in wet years — PNW humidity"],
    "aug": ["reduce fertilizer", "fruits coloring up — red, yellow, or orange depending on cultivar", "watch for powdery mildew"],
    "sep": ["resume light fertilizing", "fruits ripe and colorful — ornamental display", "birds may eat smaller fruits"],
    "oct": ["final fertilizer", "fruits persistent into autumn — beautiful display", "fall color developing"],
    "nov": ["leaves dropping — fruits may persist on bare branches", "wire for structure", "clean up fallen fruit and leaves — prevents fungal issues"],
    "dec": ["dormancy — any remaining fruits add winter interest", "cold-hardy, keep outdoors", "plan next year''s work"]
  }',
  ARRAY[3, 4, 5, 6, 7, 8],
  'outdoor',
  'intermediate',
  'Keep evenly moist during growing season. Moderate water needs. Do not let dry out when fruiting. Well-suited to PNW natural rainfall.',
  'Full sun for best flowering and fruiting. Minimum 6 hours direct sun.',
  'Outstanding flowering and fruiting bonsai. Pink buds open to white blossoms in spring, followed by ornamental crabapples in autumn. Multi-season interest: spring flowers, summer foliage, autumn fruit and color, winter silhouette with persistent fruits. Many cultivars available — choose disease-resistant varieties for PNW (apple scab can be an issue in wet springs). Malus floribunda and M. halliana are popular for bonsai.'
);
