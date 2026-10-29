import type { RegionId, TopicId } from "@/lib/news/types";
import type { Principle, StrategicOption } from "./types";

/**
 * The business-mechanism library.
 *
 * Each mechanism explains, in plain English, how a kind of development
 * tends to move a commercial variable that matters to an Australian
 * importer and distributor of polymer resins and packaging film: landed
 * cost, lead times, availability, demand, working capital or compliance.
 *
 * Mechanisms are matched from a story's topics (and sometimes regions).
 * They produce inferences, never facts: the story supplies the fact, the
 * mechanism supplies the reasoning, and the reader supplies the judgement.
 */

export interface Mechanism {
  id: string;
  name: string;
  topics: TopicId[];
  /** Restrict to stories touching these regions; omit for any region. */
  regions?: RegionId[];
  /** When present, the story text must match for the mechanism to apply; keeps "trade" from always meaning "tariff". */
  triggers?: RegExp;
  /** Priority when several mechanisms match; higher wins the lead position. */
  priority: number;
  chain: string;
  implication: string;
  secondOrder: string[];
  unknowns: string[];
  options: StrategicOption[];
  question: string;
  counterpoint: string;
  indicator: string;
  principle: Principle;
}

export const MECHANISMS: Mechanism[] = [
  {
    id: "tariff-landed-cost",
    name: "Tariffs and landed cost",
    topics: ["trade"],
    triggers: /tariff|duties|duty|anti-dumping|countervailing|quota|levy|levies|customs/i,
    priority: 9,
    chain:
      "A tariff is a cost added at the border. It raises the landed cost of affected goods in the importing country, shifts sourcing toward exempt origins, and can push displaced volume into other markets at lower prices.",
    implication:
      "For an Australian importer the direct effect depends on whether the goods, origin and destination in the story overlap with its own lanes. The indirect effect is often larger: volume that can no longer enter the tariffing market looks for a new home, which can lower prices and lift availability in Australia, while suppliers who lose a market may seek to recover margin elsewhere.",
    secondOrder: [
      "Trade diverted from a tariffed market can arrive in Australia at discounted prices, pressuring local pricing and margins for distributors holding higher-cost stock.",
      "Suppliers in the affected origin may re-route production through third countries, changing lead times and the paperwork needed to prove origin.",
    ],
    unknowns: [
      "Which product codes are covered, and whether polymer resins or packaging film are among them.",
      "Whether exemptions, phase-ins or retaliation follow.",
    ],
    options: [
      { action: "Map which supplier lanes touch the tariffing or tariffed country and estimate the landed-cost delta at the quoted rate.", tradeoff: "Takes analyst time and depends on tariff schedules that may change again." },
      { action: "Ask suppliers in the affected origin whether they expect displaced volume and what it would do to their offer prices.", tradeoff: "Suppliers may talk their own book; cross-check with a second source." },
      { action: "Hold inventory decisions for a cycle rather than buying ahead of a tariff that may not apply to this category.", tradeoff: "Waiting risks a price move if the tariff does land." },
    ],
    question: "Which of our supplier lanes, if any, cross the border this tariff applies to, and have we checked the product codes rather than assuming?",
    counterpoint: "Announced tariffs are often narrowed, delayed or exempted before they bite, and the direct exposure for this category may be zero.",
    indicator: "The published tariff schedule and product-code list, and the first offer prices from suppliers in the affected origin.",
    principle: {
      title: "Landed cost is the price that matters",
      text: "A supplier's quote is only part of the cost of a product on your shelf. Freight, duties, insurance, currency and handling complete it. A tariff changes landed cost without touching the quote, so compare landed costs, not invoices.",
      lessonSlug: "freight-and-landed-cost",
    },
  },
  {
    id: "export-controls",
    name: "Export controls and sanctions",
    topics: ["trade", "geopolitics"],
    triggers: /sanction|export control|export ban|import ban|embargo|blacklist|entity list/i,
    priority: 8,
    chain:
      "Export controls and sanctions restrict who may sell what to whom. They cut supply from a named origin, raise compliance cost for everyone trading near the restriction, and can trigger counter-measures that widen the affected product set.",
    implication:
      "Even when polymers are not named, controls change behaviour across the supply chain: banks and insurers tighten screening, shipping lines avoid flagged ports, and suppliers in third countries become more cautious about origin documentation. The commercial effect is usually slower, costlier paperwork before it is lost supply.",
    secondOrder: [
      "Compliance checks on payments and shipping documents may add days to transactions involving the affected country.",
      "Suppliers in neighbouring countries may gain share, and their lead times may lengthen as demand shifts to them.",
    ],
    unknowns: [
      "Whether the measures touch petrochemical feedstocks, resins or the companies that make them.",
      "How financial institutions and insurers interpret the rules in practice.",
    ],
    options: [
      { action: "Confirm with the finance and logistics teams that none of the sanctioned entities or ports appears in current supplier, bank or shipping arrangements.", tradeoff: "A screening exercise costs time, but the cost of a blocked payment is far higher." },
      { action: "Ask the most exposed supplier how they are documenting origin and whether their banks have changed requirements.", tradeoff: "Puts a relationship question on the table; frame it as planning, not suspicion." },
    ],
    question: "Has anyone checked whether these measures reach into the companies, banks or ports we use, rather than assuming they are about someone else?",
    counterpoint: "Most sanctions regimes are narrowly targeted, and the day-to-day effect on unrelated commodity trade is often small after an initial period of caution.",
    indicator: "Official entity lists and guidance from the relevant trade authority, and whether banks begin asking for extra documentation.",
    principle: {
      title: "Compliance cost is a real cost",
      text: "Rules that never name your product can still slow your cash and your cargo. The time a payment or shipment spends waiting for a check is working capital and lead time, and both carry a price.",
      lessonSlug: "working-capital",
    },
  },
  {
    id: "trade-flows",
    name: "Trade flows, demand and negotiations",
    topics: ["trade"],
    priority: 8,
    chain:
      "Trade statistics and trade negotiations show where demand is strong, where capacity is seeking a home, and where policy may move next. A widening import bill signals firm demand in the importing country; a surge in exports from a producing region signals surplus looking for buyers; talks and agreements change the rules that volumes flow under.",
    implication:
      "For an Australian importer the signal is about direction before it is about cost: strong demand in a large market tends to firm prices and tighten supplier capacity, while surplus seeking buyers tends to soften them. Trade talks matter through the measures they may produce, which are not yet in force.",
    secondOrder: [
      "Demand that is strong enough to widen a trade deficit tends to keep the importing country's currency and interest rates firmer, which reaches the Australian dollar and import costs.",
      "Negotiations that stall are often followed by measures that redirect flows; the direction of the redirected volume is the thing to watch.",
    ],
    unknowns: [
      "Which product categories drive the headline numbers and whether polymers are among them.",
      "Whether the trend persists beyond one month's data.",
    ],
    options: [
      { action: "Read the product breakdown behind the headline trade figure to see whether plastics, chemicals or packaging are moving.", tradeoff: "Official breakdowns lag and are revised; treat one month lightly." },
      { action: "Ask suppliers in the exporting region whether order books reflect the trend the data shows.", tradeoff: "Anecdote, but earlier than statistics." },
    ],
    question: "Does this trade signal tell us demand is firming or surplus is building in a region we buy from, and which way would that move prices?",
    counterpoint: "Monthly trade figures are volatile and often driven by a few categories, such as electronics or energy, with no bearing on polymers.",
    indicator: "The next two monthly trade releases for the country, and supplier lead times from the region.",
    principle: {
      title: "Trade data is a demand signal",
      text: "Imports rise where demand is strong and exports rise where surplus is building. Reading the direction tells you whether suppliers in a region are about to gain or lose pricing power, months before the price moves.",
      lessonSlug: "demand-and-trade-offs",
    },
  },
  {
    id: "fx-purchasing-power",
    name: "Exchange rates and purchasing power",
    topics: ["currency"],
    priority: 8,
    chain:
      "Most internationally traded resin and film is priced in US dollars. When the Australian dollar weakens against the US dollar, the same USD quote costs more in AUD; when it strengthens, landed cost falls. Supplier-currency moves (yuan, baht, dong, ringgit) affect suppliers' own margins and their willingness to hold prices.",
    implication:
      "A currency move changes landed cost on every open USD-priced order that is not hedged, immediately and across all origins at once. It also changes the competitive position of Australian customers who export, which feeds back into demand.",
    secondOrder: [
      "A weaker AUD makes imported goods dearer and can lift local inflation, which in turn shapes the next interest-rate decision and domestic demand.",
      "Suppliers whose own currency has weakened against the US dollar earn more at the same USD price and may have room to hold or cut prices.",
    ],
    unknowns: [
      "How much of forward purchasing is hedged, and at what rates.",
      "Whether the move is a short-lived reaction or a change in trend.",
    ],
    options: [
      { action: "Check the unhedged USD exposure on open orders and the next quarter's expected purchases against the current rate.", tradeoff: "Hedging locks a rate and removes upside as well as downside." },
      { action: "Compare suppliers by their home currency: a weaker supplier currency may create room to negotiate.", tradeoff: "Suppliers price in USD precisely to avoid this conversation; expect resistance." },
    ],
    question: "What does a five-cent move in the Australian dollar do to our landed cost over the next quarter, and how much of that is already hedged?",
    counterpoint: "Currency moves are two-sided and frequently reverse; reacting to each move is costlier than a steady hedging policy.",
    indicator: "The AUD/USD rate against the level assumed in current pricing, and the RBA's next statement.",
    principle: {
      title: "You buy in dollars and sell in Australian dollars",
      text: "An importer carries currency risk between the day a USD price is agreed and the day the AUD invoice is paid. Knowing the exposure, the hedge ratio and the break-even rate turns a surprise into a managed variable.",
      lessonSlug: "fx-exposure",
    },
  },
  {
    id: "rates-demand",
    name: "Interest rates, demand and the cost of inventory",
    topics: ["currency", "demand"],
    priority: 6,
    chain:
      "Interest-rate decisions move in two directions at once: they change the cost of financing inventory and receivables, and they change customers' demand through housing, construction, consumer spending and investment.",
    implication:
      "For a distributor, every week of stock and every day of receivables is financed. Higher rates make inventory dearer to hold and slow the end markets that consume packaging and moulded products; lower rates do the reverse, with a lag of several months.",
    secondOrder: [
      "A rate cut tends to weaken the currency, which can offset the benefit for an importer by lifting landed cost.",
      "Customers under financing pressure may stretch payment terms, shifting working capital onto suppliers.",
    ],
    unknowns: [
      "The size and timing of pass-through to customer demand in the specific end markets served.",
      "Whether the decision is a one-off or the start of a cycle.",
    ],
    options: [
      { action: "Recompute the carrying cost of current inventory at the new rate and compare it with the service-level benefit of holding it.", tradeoff: "Cutting stock to save financing cost risks stockouts if demand is firmer than expected." },
      { action: "Review payment terms and overdue receivables with the credit team; a changing rate environment changes customer behaviour.", tradeoff: "Tightening terms can cost volume." },
    ],
    question: "How much does a one-point change in rates add to our cost of carrying inventory, and does our stock policy reflect it?",
    counterpoint: "Demand in packaging-heavy sectors such as food is relatively insensitive to rates; the main effect may be on financing cost rather than volume.",
    indicator: "The cash rate, the yield on short-term bank bills, and monthly retail and building-approvals data.",
    principle: {
      title: "Inventory has a carrying cost",
      text: "Stock on the floor is cash that is not in the bank. Financing, storage, insurance and obsolescence together typically cost a meaningful percentage of inventory value each year, and that cost rises with interest rates.",
      lessonSlug: "inventory-and-service-levels",
    },
  },
  {
    id: "freight-lead-time",
    name: "Freight disruption and lead times",
    topics: ["freight"],
    priority: 9,
    chain:
      "A disruption to a shipping route or port lengthens transit times, tightens vessel and container capacity, and lifts freight rates and surcharges. Longer, less predictable transit means more stock must be held to maintain the same service level.",
    implication:
      "For goods imported by sea, the first effect is on lead time and reliability, the second on freight cost, and the third on working capital as safety stock rises. A disruption on one route can ripple to others as carriers reposition ships and containers.",
    secondOrder: [
      "Carriers may blank sailings or impose surcharges on unaffected lanes to rebalance capacity, so Australian import rates can rise even when the disruption is elsewhere.",
      "Longer transit times increase the amount of stock in transit, lifting inventory on the balance sheet without any change in purchasing.",
    ],
    unknowns: [
      "How long the disruption lasts and whether carriers have already priced it in.",
      "Whether the affected route carries a meaningful share of supply into Australia.",
    ],
    options: [
      { action: "Check which supplier shipments are on or near the affected route and get updated ETAs rather than relying on standard transit assumptions.", tradeoff: "Costs a round of supplier and forwarder calls; cheap relative to a stockout." },
      { action: "Review safety-stock levels for lines sourced through the affected region against the new lead-time variability.", tradeoff: "More safety stock means more working capital tied up." },
      { action: "Ask the forwarder for current spot versus contract rates and whether surcharges are being applied to Australian lanes.", tradeoff: "Spot visibility helps negotiation but can prompt a rate review." },
    ],
    question: "Which of our inbound shipments are on this route, and what do the revised ETAs do to our stock cover over the next eight weeks?",
    counterpoint: "Carriers and forwarders adapt quickly; most disruptions show up as a few extra days and a surcharge rather than a shortage.",
    indicator: "Container freight-rate indices for Asia–Australia lanes and the forwarder's weekly schedule-reliability report.",
    principle: {
      title: "Lead time drives safety stock",
      text: "The stock you must hold to avoid running out depends on how long and how variable your replenishment lead time is. When transit becomes slower or less predictable, the same service level costs more inventory.",
      lessonSlug: "inventory-and-service-levels",
    },
  },
  {
    id: "route-risk",
    name: "Maritime security and route risk",
    topics: ["geopolitics", "freight"],
    regions: ["middle-east"],
    priority: 10,
    chain:
      "Threats to shipping in the Red Sea, the Gulf or the Strait of Hormuz raise war-risk insurance premiums and push carriers to reroute around Africa or avoid the region. Rerouting adds transit days, absorbs vessel capacity and lifts rates on linked lanes; tanker disruption moves oil and gas prices, which feed the petrochemical cost base.",
    implication:
      "Australia's resin imports from the Middle East and much of Europe-Asia trade pass through these waters. A security development there can lengthen lead times from Gulf suppliers, raise freight and insurance costs, and lift feedstock prices for every producer at once.",
    secondOrder: [
      "Higher oil and naphtha prices flow into polymer offer prices in Asia with a lag of several weeks.",
      "Capacity absorbed by longer routes tightens container supply on Asia–Australia lanes, raising rates there too.",
    ],
    unknowns: [
      "Whether the development is a threat, an incident or a sustained change in the risk environment.",
      "How insurers and carriers respond, which matters more than the headline.",
    ],
    options: [
      { action: "Confirm with Gulf-origin suppliers and the forwarder whether current shipments are rerouting and what the revised transit is.", tradeoff: "A few calls now; cheap relative to discovering a two-week delay later." },
      { action: "Review the share of supply that depends on the affected waterway and whether an alternative origin exists for critical lines.", tradeoff: "Dual sourcing raises complexity and may cost price." },
    ],
    question: "How much of our supply passes through this waterway, and what is our fallback if transit from the Gulf lengthens by two weeks?",
    counterpoint: "Shipping has operated through elevated risk in the region for long stretches; the market often prices the risk without a loss of supply.",
    indicator: "War-risk insurance premiums for the area, carrier routing notices, and the Brent crude price.",
    principle: {
      title: "Chokepoints concentrate risk",
      text: "A small number of waterways carry a large share of world trade. When one is threatened, the cost shows up first in insurance and rerouting, then in transit time, and finally in the price of everything that passed through it.",
      lessonSlug: "freight-and-landed-cost",
    },
  },
  {
    id: "energy-feedstock",
    name: "Energy prices and the polymer cost base",
    topics: ["energy"],
    priority: 8,
    chain:
      "Polymers are made from oil and gas derivatives. Asian and Middle Eastern producers mostly crack naphtha, which tracks crude; US producers mostly crack ethane, which tracks natural gas. A move in crude changes the cost base of naphtha-based suppliers quickly, and the gap between crude and gas changes which origin is cheapest.",
    implication:
      "A rise in crude tends to lift Asian resin offer prices within weeks and widens the cost advantage of US ethane-based producers; a fall does the reverse. Energy also sets the cost of converting resin into film and products, so customers' margins move too.",
    secondOrder: [
      "When the crude-to-gas spread widens, US exporters gain share in Asia, and Asian producers may cut runs, tightening regional supply.",
      "Energy-driven inflation can prompt central banks to hold rates higher for longer, dampening demand.",
    ],
    unknowns: [
      "Whether the energy move is driven by supply, demand or sentiment, which affects how long it lasts.",
      "How quickly suppliers pass the change through, which depends on their inventory and contract terms.",
    ],
    options: [
      { action: "Compare recent offer prices from naphtha-based and ethane-based origins against the crude and gas moves to see who is passing through what.", tradeoff: "Requires keeping a simple price-tracking sheet; small effort for a lasting view." },
      { action: "Time larger purchases with the lag in mind: offer prices usually follow crude by several weeks.", tradeoff: "Timing the market is uncertain; the lag is a tendency, not a rule." },
    ],
    question: "Given the move in crude, which origins should we expect to raise prices first, and have we locked anything in ahead of that?",
    counterpoint: "Polymer prices are set by supply and demand balance as much as by feedstock; in an oversupplied market producers absorb energy moves rather than pass them on.",
    indicator: "Brent crude and the Asian naphtha price, alongside the next round of supplier offers.",
    principle: {
      title: "Know your supplier's feedstock",
      text: "Two suppliers quoting the same resin may have very different cost bases. A naphtha-based producer feels crude; an ethane-based producer feels gas. Knowing which is which tells you who will move first and who has room to hold.",
      lessonSlug: "supplier-price-increases",
    },
  },
  {
    id: "polymer-market",
    name: "Polymer supply, capacity and price direction",
    topics: ["polymers"],
    priority: 10,
    chain:
      "Resin prices move with the balance between cracker capacity and demand. New capacity, especially in China and the Gulf, pushes prices down and exporters outward; outages, turnarounds and force majeure tighten supply and lift prices quickly.",
    implication:
      "Developments in the polymer market reach landed cost directly. Oversupply favours buyers and tends to keep prices soft; a tightening favours producers and shortens the window in which current prices hold.",
    secondOrder: [
      "Producers facing oversupply at home export more aggressively, which can pressure prices in Australia and shift the mix of origins on offer.",
      "A tightening in one grade can push converters to substitute, moving demand across grades and suppliers.",
    ],
    unknowns: [
      "The grades and volumes involved, and whether they match what is bought.",
      "How much of the change is already reflected in current offers.",
    ],
    options: [
      { action: "Ask key suppliers for their view on the balance for the next quarter and compare it with this development.", tradeoff: "Supplier views are interested views; weigh them against independent price assessments." },
      { action: "Review contract versus spot purchasing mix: a softening market favours shorter commitments, a tightening one favours cover.", tradeoff: "Shorter commitments trade price certainty for flexibility." },
    ],
    question: "Does this change the supply balance for the grades we buy most, and should it change how far ahead we are committing?",
    counterpoint: "Headline capacity or outage numbers often overstate the effect on any one grade or region; local balances can diverge from the global picture.",
    indicator: "Independent polymer price assessments for Southeast Asia and the next supplier offer round.",
    principle: {
      title: "Price follows balance",
      text: "In a commodity market, price is set by whether supply or demand is tighter at the margin. Watching capacity additions, outages and export flows tells you which way the next price move is likely to lean.",
      lessonSlug: "supplier-price-increases",
    },
  },
  {
    id: "manufacturing-conditions",
    name: "Manufacturing conditions and supplier capacity",
    topics: ["manufacturing"],
    priority: 7,
    chain:
      "Factory activity data (PMIs, industrial production, new orders) show whether a supplier region is running hot or cold. Strong activity tightens capacity, lengthens lead times and strengthens suppliers' pricing power; weak activity does the reverse and can push suppliers to chase export volume.",
    implication:
      "For a buyer, a weakening manufacturing picture in a supplier region usually means more negotiating room and more available capacity, at the cost of some supplier fragility. A strengthening picture means securing allocation matters more than price.",
    secondOrder: [
      "Governments respond to weak manufacturing with stimulus or export support, which can change the price and availability of goods months later.",
      "Prolonged weakness can lead to consolidation or closures among smaller suppliers, reducing choice.",
    ],
    unknowns: [
      "Whether the sector in the data includes petrochemicals and plastics or is driven by other industries.",
      "How individual suppliers are faring relative to the aggregate.",
    ],
    options: [
      { action: "Use the data as context in the next supplier conversation: a supplier in a soft market may welcome volume commitments in exchange for price.", tradeoff: "Longer commitments reduce flexibility." },
      { action: "Check the financial health signals of smaller suppliers in a weakening region.", tradeoff: "Due diligence costs time and can strain relationships if handled bluntly." },
    ],
    question: "Is this a sector-wide slowdown or one that touches our suppliers specifically, and what does it do to their appetite for our business?",
    counterpoint: "Aggregate manufacturing indices are noisy month to month; one reading rarely changes a supplier's position.",
    indicator: "The next two PMI readings for the region and suppliers' quoted lead times.",
    principle: {
      title: "Supplier power moves with the cycle",
      text: "Negotiating leverage is not fixed. When a supplier's order book is thin, volume is worth more to them than price; when it is full, allocation matters more than discounts. Reading the cycle tells you which conversation to have.",
      lessonSlug: "supplier-price-increases",
    },
  },
  {
    id: "regulation-compliance",
    name: "Packaging regulation and sustainability requirements",
    topics: ["regulation"],
    priority: 7,
    chain:
      "Rules on packaging, recycled content, single-use plastics and extended producer responsibility change which materials customers may use and what they must prove about them. They shift demand between grades (virgin to recycled, one polymer to another) and add documentation and certification requirements along the chain.",
    implication:
      "Regulation changes demand before it changes supply. A mandate for recycled content lifts demand for certified recycled resin and the paperwork that proves it; a ban on a format removes demand for the resin that made it. Suppliers who can certify and document gain an advantage.",
    secondOrder: [
      "Certified recycled grades can command a premium and face supply constraints, changing the economics for customers under mandate.",
      "Rules introduced in one major market tend to be adopted elsewhere, so an overseas change can preview Australian requirements.",
    ],
    unknowns: [
      "The scope, timeline and enforcement of the rule, which often change between announcement and effect.",
      "Whether customers' products and formats are within scope.",
    ],
    options: [
      { action: "Check which customers and product formats fall within the scope of the rule and whether suppliers can provide the certification it requires.", tradeoff: "A scoping exercise across customers takes time but positions the business ahead of demand." },
      { action: "Ask suppliers about recycled-content and certification capability before customers ask.", tradeoff: "Early commitments to new grades carry price and availability risk." },
    ],
    question: "Which of our customers will this rule touch first, and can our suppliers document what those customers will need to prove?",
    counterpoint: "Regulatory timelines slip, and enforcement is often lighter than the legislation suggests; demand shifts can be slower than announced.",
    indicator: "The published regulation and compliance dates, and customer enquiries about certified or recycled grades.",
    principle: {
      title: "Rules reshape demand",
      text: "Regulation is a demand signal with a date on it. Reading what a rule requires, who it applies to and when tells you which products will be wanted and which will fade, often years ahead of the market.",
      lessonSlug: "demand-and-trade-offs",
    },
  },
  {
    id: "demand-inventory",
    name: "Demand shifts, pricing and inventory",
    topics: ["demand"],
    priority: 6,
    chain:
      "Changes in end demand flow back through the chain: softer consumer or industrial demand slows converters' orders, lengthens the time stock sits, and weakens pricing; firmer demand does the opposite. Inventory positions along the chain amplify the swing.",
    implication:
      "A distributor sits between producer pricing and customer demand. When demand softens, stock bought at earlier prices becomes harder to move at margin; when it firms, availability and service level win business. The right inventory response depends on whether the shift is temporary or structural.",
    secondOrder: [
      "Converters facing weak demand destock, which cuts orders by more than the fall in consumption; restocking later does the reverse.",
      "Softer demand gives customers leverage to push for price and terms, moving margin and working capital pressure upstream.",
    ],
    unknowns: [
      "Which end markets are moving and whether they overlap with the customer base.",
      "Whether the change reflects consumption or inventory adjustment.",
    ],
    options: [
      { action: "Compare recent customer order patterns with the demand signal to see whether destocking has begun.", tradeoff: "Order data lags; by the time it confirms a trend, part of the move is over." },
      { action: "Review slow-moving stock and the pricing needed to clear it before the next buying cycle.", tradeoff: "Clearing stock at lower margin protects cash but can set a price reference with customers." },
    ],
    question: "Are our customers' orders moving with this demand signal, and are we seeing destocking or a real change in consumption?",
    counterpoint: "Packaging demand for food and essentials is steadier than headline consumer sentiment suggests.",
    indicator: "Weekly order intake against the same period last year, and days of inventory on hand by product line.",
    principle: {
      title: "Destocking amplifies demand swings",
      text: "When customers expect softer demand, they run down stock, and orders fall faster than consumption. When confidence returns, they restock and orders rise faster. Distinguishing the two prevents overreaction in both directions.",
      lessonSlug: "demand-and-trade-offs",
    },
  },
  {
    id: "china-capacity",
    name: "Chinese industrial policy and polymer exports",
    topics: ["manufacturing", "trade", "polymers"],
    regions: ["china"],
    priority: 8,
    chain:
      "China is the world's largest producer and consumer of polymers and has added more cracker capacity than its domestic demand can absorb. Weak domestic demand or supportive industrial policy pushes surplus volume into export markets, including Southeast Asia and Australia, at competitive prices.",
    implication:
      "Chinese export flows set a price ceiling for many commodity grades across the region. A development that increases Chinese exports tends to soften regional prices and widen supplier choice; one that curbs them (export restrictions, run cuts, anti-dumping actions elsewhere) tends to firm prices.",
    secondOrder: [
      "Trading partners respond to export surges with anti-dumping investigations, which can redirect flows again.",
      "Southeast Asian producers compete with Chinese exports and may lose margin or cut runs, affecting their reliability as suppliers.",
    ],
    unknowns: [
      "Which grades and volumes are affected and whether they are ones Australian customers use.",
      "Whether anti-dumping or safeguard actions follow in Australia or neighbouring markets.",
    ],
    options: [
      { action: "Track offer prices from Chinese and Southeast Asian origins side by side to see whether the development is already moving the spread.", tradeoff: "Needs a maintained price view; modest effort." },
      { action: "Consider the reputational and quality dimension of shifting volume toward the lowest-cost origin, not only the price.", tradeoff: "Quality assurance and customer acceptance take time to establish." },
    ],
    question: "Is Chinese export pressure on this grade rising or easing, and what does that do to the price gap between our origins?",
    counterpoint: "Chinese producers also face feedstock and policy constraints; export surges tend to be episodic rather than permanent.",
    indicator: "Chinese monthly polymer export volumes and the price spread between Chinese and Southeast Asian offers.",
    principle: {
      title: "The marginal exporter sets the price",
      text: "In a global commodity, the producer with surplus to export sets the price everyone else must meet. Watching where surplus is building tells you where the next price pressure will come from.",
      lessonSlug: "supplier-price-increases",
    },
  },
  {
    id: "australia-home-market",
    name: "Australian economic conditions",
    topics: ["currency", "demand", "trade"],
    regions: ["australia"],
    priority: 7,
    chain:
      "Australian data and policy set the home-market side of the equation: the cash rate and the dollar set financing and landed cost, trade statistics show what is being imported and from where, and domestic demand determines what customers buy.",
    implication:
      "A change in Australian conditions affects every supplier relationship at once, through the currency and through customer demand, rather than one region at a time. It is also the context in which any overseas development should be read.",
    secondOrder: [
      "Australian policy moves shape the currency, which changes the relative attractiveness of each supplier origin.",
      "Shifts in Australian import statistics can reveal changes in competitors' sourcing before they are visible in the market.",
    ],
    unknowns: [
      "How much of the headline change reaches the specific customer segments served.",
      "The timing of pass-through, which is usually measured in months.",
    ],
    options: [
      { action: "Read the development alongside the current AUD/USD rate and the demand signals from the customer base.", tradeoff: "Context, not action; the value is in better judgement on other decisions." },
      { action: "Check the latest ABS trade data for the relevant product codes to see import trends by origin.", tradeoff: "Official data lags by several weeks." },
    ],
    question: "What does this do to the two Australian variables that matter most to us: the dollar and our customers' demand?",
    counterpoint: "Single data releases are frequently revised; policy is set on trends, not on one print.",
    indicator: "The RBA's statement and forecasts, the AUD/USD rate, and monthly retail trade and building approvals.",
    principle: {
      title: "Read the world through the home market",
      text: "An overseas event matters to an Australian business only through a few channels: the currency, the cost and availability of what it buys, and the demand of what it sells. Naming the channel is the first step in judging the effect.",
      lessonSlug: "profit-and-loss",
    },
  },
  {
    id: "sea-supply-base",
    name: "Southeast Asian supply conditions",
    topics: ["manufacturing", "freight", "trade", "energy", "polymers"],
    regions: ["sea"],
    priority: 6,
    chain:
      "Southeast Asia is both a major polymer-producing region (Thailand, Singapore, Malaysia, Indonesia) and a growing manufacturing base that competes with China for export orders. Its producers are mostly naphtha-based and price in US dollars; its ports and shipping links to Australia are relatively short.",
    implication:
      "Developments in the region affect the cost base, capacity and reliability of a large share of resin supply into Australia. Because transit is short, the region is often where a disruption elsewhere is first worked around, and where Chinese export pressure is first felt.",
    secondOrder: [
      "Tariff shifts between the US and China move manufacturing investment into the region, tightening industrial capacity and logistics.",
      "Regional producers squeezed by Chinese exports may cut runs or consolidate, reducing supplier choice.",
    ],
    unknowns: [
      "Which country and which producers are affected; the region is diverse and the aggregate hides large differences.",
      "Whether the development reaches the polymer sector or is confined to other industries.",
    ],
    options: [
      { action: "Identify which country in the region the story concerns and whether current suppliers are located there.", tradeoff: "Simple, and avoids treating the region as one market." },
      { action: "Ask regional suppliers how the development affects their run rates, lead times and pricing.", tradeoff: "A conversation, not a commitment." },
    ],
    question: "Which country and which producers does this touch, and are they ones we rely on?",
    counterpoint: "The region's diversity means a shock in one country is often absorbed by neighbours with spare capacity.",
    indicator: "Regional PMI readings, naphtha prices and supplier lead-time quotes.",
    principle: {
      title: "A region is not a market",
      text: "Southeast Asia and the Middle East are groups of very different economies. Judging a development means naming the country, the producers and the ports involved, not the region on the map.",
      lessonSlug: "supplier-price-increases",
    },
  },
  {
    id: "us-policy",
    name: "US trade policy, the dollar and petrochemical exports",
    topics: ["trade", "currency", "energy", "manufacturing"],
    regions: ["usa"],
    priority: 6,
    chain:
      "US decisions reach Australian importers through three channels: tariffs and trade measures that redirect global flows; the Federal Reserve and the US dollar, which set the currency most resin is priced in; and the US position as a low-cost, ethane-based polymer exporter.",
    implication:
      "A US trade measure rarely targets Australia directly, but it reshapes where surplus volume goes. A Fed move changes the US dollar against every currency at once, including the Australian dollar. A change in US export competitiveness alters the price US-origin resin can offer in Asia and Australia.",
    secondOrder: [
      "Retaliation against US measures by other countries can catch unrelated products and create new trade flows.",
      "Dollar strength tightens financial conditions in emerging markets, including supplier countries, affecting their currencies and credit.",
    ],
    unknowns: [
      "Whether the measure survives legal and political challenge in the form announced.",
      "How trading partners respond.",
    ],
    options: [
      { action: "Trace the likely path of displaced volume: which products lose their US market and where they might go instead.", tradeoff: "An analytical exercise with uncertain conclusions; still better than assuming no effect." },
      { action: "Watch the AUD/USD reaction and update the currency assumption in current pricing if the move persists.", tradeoff: "Reacting to a short-lived move can whipsaw pricing." },
    ],
    question: "Through which channel does this US development reach us: diverted trade, the dollar, or US export pricing?",
    counterpoint: "US policy announcements are frequently softened in implementation, and markets often reverse their first reaction.",
    indicator: "The US dollar index and AUD/USD, and the official notice implementing the measure.",
    principle: {
      title: "Three channels from Washington",
      text: "Most US developments reach an Australian importer through diverted trade, the dollar or US export pricing. Asking which channel applies keeps a headline from becoming a vague worry.",
      lessonSlug: "fx-exposure",
    },
  },
  {
    id: "structural-change",
    name: "Technology and structural change",
    topics: ["technology"],
    priority: 3,
    chain:
      "Automation, digital tools and shifts in how goods are made and moved change supplier economics slowly and then suddenly: they lower the cost base of early adopters, change the skills and capital a supplier needs, and shift where production is viable.",
    implication:
      "Structural change rarely alters next quarter's landed cost, but it decides which suppliers will still be competitive in five years and what customers will expect of a distributor's service.",
    secondOrder: [
      "Suppliers who invest in automation can hold prices while others raise them, widening the gap between origins.",
      "Customers adopting digital procurement expect faster quotes, better data and tighter delivery windows.",
    ],
    unknowns: [
      "The pace of adoption in the specific sector and region.",
      "Whether the change favours scale producers or smaller specialists.",
    ],
    options: [
      { action: "Note which suppliers are investing in the technology described and revisit the supplier assessment on that dimension.", tradeoff: "Long-horizon judgement with little short-term payoff." },
    ],
    question: "Does this change who the low-cost, reliable supplier will be in five years, and are we building relationships there?",
    counterpoint: "Technology stories tend to run ahead of adoption; the commercial effect may be years away.",
    indicator: "Capital-expenditure announcements by key suppliers and changes in their quoted lead times and service.",
    principle: {
      title: "Structural change moves slowly, then all at once",
      text: "A technology that looks irrelevant to this quarter can decide the shape of a supply base within a decade. The practical response is to watch where suppliers are investing, not to predict the technology.",
    },
  },
  {
    id: "geopolitical-uncertainty",
    name: "Geopolitical risk and trade uncertainty",
    topics: ["geopolitics"],
    priority: 4,
    chain:
      "Political and security developments raise uncertainty before they change trade. Uncertainty itself has effects: firms delay investment, insurers reprice, currencies move toward safe havens, and suppliers and customers hold more or less stock depending on what they fear.",
    implication:
      "The commercial effect of a geopolitical development is usually indirect: through the currency, through freight and insurance, and through the confidence of customers and suppliers. The question is which of those channels is engaged, if any.",
    secondOrder: [
      "Risk-off moves in markets tend to weaken the Australian dollar, lifting landed cost even when the event is far from any supplier.",
      "Suppliers in affected regions may face financing and insurance constraints that show up as longer payment terms or slower shipments.",
    ],
    unknowns: [
      "Whether the development escalates, stabilises or fades.",
      "Which, if any, trade routes, suppliers or customers are materially exposed.",
    ],
    options: [
      { action: "Identify whether any supplier, route or customer is within the affected area before deciding whether the story needs action.", tradeoff: "Most geopolitical stories will not need action; the exercise prevents both overreaction and neglect." },
    ],
    question: "Does this touch a route, a supplier or a currency we depend on, or is it context rather than exposure?",
    counterpoint: "Most geopolitical events have little lasting effect on commodity trade flows; markets adjust and routes reopen.",
    indicator: "The AUD/USD rate, war-risk insurance notices for affected areas, and supplier shipping updates.",
    principle: {
      title: "Separate exposure from context",
      text: "Not every important development is a commercial exposure. Asking whether a route, a supplier, a customer or a currency you depend on is touched turns news into either a decision or a piece of context, and both are useful.",
    },
  },
];

export const MECHANISM_BY_ID: Record<string, Mechanism> = Object.fromEntries(
  MECHANISMS.map((m) => [m.id, m]),
);
