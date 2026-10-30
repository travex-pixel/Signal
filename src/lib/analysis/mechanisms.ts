import type { RegionId, TopicId } from "@/lib/news/types";
import type { Principle, StrategicOption } from "./types";

/**
 * The business-mechanism library.
 *
 * Each mechanism explains, in plain English, how one kind of development
 * tends to move a number that matters to an Australian importer of polymer
 * resins and packaging film: landed cost, lead times, supply, demand, cash
 * or compliance.
 *
 * Mechanisms are matched from a story's topics (and sometimes its regions
 * and wording). They produce readings, never facts: the story supplies the
 * fact, the mechanism supplies the reasoning, and the reader supplies the
 * judgement. Sentences are kept short on purpose.
 */

export interface Mechanism {
  id: string;
  name: string;
  topics: TopicId[];
  /** Restrict to stories touching these regions. Omit for any region. */
  regions?: RegionId[];
  /** When present, the story text must match for the mechanism to apply. Keeps "trade" from always meaning "tariff". */
  triggers?: RegExp;
  /** Priority when several mechanisms match. Higher wins the lead position. */
  priority: number;
  chain: string;
  implication: string;
  secondOrder: string[];
  unknowns: string[];
  options: StrategicOption[];
  question: string;
  /** One sentence she could say aloud in a meeting: plain, under about 22 words, no quoted headline. */
  say: string;
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
      "A tariff is a tax paid at the border. It makes the affected goods dearer in the country that charges it. Buyers there look for other origins. Goods that can no longer get in look for other markets, often at lower prices.",
    implication:
      "For an Australian importer, the direct effect depends on one thing: do your goods, your supplier's country and the destination match the ones in the story? Often they do not. The indirect effect is usually bigger. Goods shut out of one market go looking for a new home. That can mean lower prices and more supply in Australia. Suppliers who lose a market may also try to recover their margin elsewhere.",
    secondOrder: [
      "Goods diverted from the tariffed market can arrive in Australia at discounted prices. That squeezes distributors still holding stock bought at higher prices.",
      "Suppliers in the affected country may route production through a third country. That changes lead times and the paperwork needed to prove where goods come from.",
    ],
    unknowns: [
      "Which product codes are covered, and whether polymer resins or packaging film are among them.",
      "Whether exemptions, delays or retaliation follow.",
    ],
    options: [
      { action: "List which supplier lanes touch the country charging the tariff or the country hit by it. Estimate the change in landed cost at the quoted rate.", tradeoff: "Takes some analyst time, and tariff schedules often change again." },
      { action: "Ask suppliers in the affected country whether they expect to have spare volume, and what that would do to their prices.", tradeoff: "Suppliers may talk up their position. Check with a second source." },
      { action: "Wait one cycle before buying ahead of a tariff that may not apply to this category.", tradeoff: "Waiting risks a price move if the tariff does land." },
    ],
    question: "Which of our supplier lanes, if any, cross the border this tariff applies to? Have we checked the product codes rather than assuming?",
    say: "The question for us is whether our product codes and origins fall under this tariff, and what it adds to landed cost.",
    counterpoint: "Announced tariffs are often narrowed, delayed or exempted before they take effect. The direct exposure for this category may be zero.",
    indicator: "The published tariff schedule and product-code list, and the first offer prices from suppliers in the affected country.",
    principle: {
      title: "Landed cost is the price that matters",
      text: "A supplier's quote is only part of the cost of a product on your shelf. Freight, duties, insurance, currency and handling complete it. A tariff changes landed cost without touching the quote. Compare landed costs, not invoices.",
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
      "Export controls and sanctions limit who may sell what to whom. They cut supply from the named country. They also raise the cost of doing business for everyone trading near the restriction. Counter-measures can widen the list of affected products.",
    implication:
      "Even when polymers are not named, controls change behaviour along the supply chain. Banks and insurers check more carefully. Shipping lines avoid flagged ports. Suppliers in nearby countries become more careful about proving where goods come from. The first effect is usually slower, costlier paperwork, not lost supply.",
    secondOrder: [
      "Compliance checks on payments and shipping documents may add days to any transaction involving the affected country.",
      "Suppliers in neighbouring countries may win share, and their lead times may lengthen as demand shifts to them.",
    ],
    unknowns: [
      "Whether the measures touch petrochemical feedstocks, resins or the companies that make them.",
      "How banks and insurers apply the rules in practice.",
    ],
    options: [
      { action: "Confirm with finance and logistics that none of the named companies, banks or ports appears in current supplier, bank or shipping arrangements.", tradeoff: "A screening exercise takes time. A blocked payment costs far more." },
      { action: "Ask the most exposed supplier how they document origin, and whether their banks have changed their requirements.", tradeoff: "This is a relationship question. Frame it as planning, not suspicion." },
    ],
    question: "Has anyone checked whether these measures reach into the companies, banks or ports we use, rather than assuming they are about someone else?",
    say: "We should check whether these measures reach the companies, banks or ports we actually use.",
    counterpoint: "Most sanctions are narrowly targeted. After an initial period of caution, the day-to-day effect on unrelated commodity trade is often small.",
    indicator: "Official lists and guidance from the relevant trade authority, and whether banks begin asking for extra documents.",
    principle: {
      title: "Compliance cost is a real cost",
      text: "Rules that never name your product can still slow your cash and your cargo. The time a payment or shipment spends waiting for a check is working capital and lead time. Both carry a price.",
      lessonSlug: "working-capital",
    },
  },
  {
    id: "trade-flows",
    name: "Trade flows, demand and negotiations",
    topics: ["trade"],
    priority: 8,
    chain:
      "Trade statistics and trade talks show where demand is strong, where surplus is looking for buyers, and where policy may move next. A rising import bill means firm demand in that country. A surge of exports from a producing region means surplus looking for a home. Talks and agreements change the rules that goods move under.",
    implication:
      "For an Australian importer, the signal is about direction before it is about cost. Strong demand in a large market tends to firm prices and fill supplier capacity. Surplus looking for buyers tends to soften prices. Trade talks matter through the measures they may produce, which are not yet in force.",
    secondOrder: [
      "Demand strong enough to widen a trade deficit tends to keep that country's currency and interest rates firm. That reaches the Australian dollar and import costs.",
      "Talks that stall are often followed by measures that redirect trade. Where the redirected volume goes is the thing to watch.",
    ],
    unknowns: [
      "Which products drive the headline numbers, and whether polymers are among them.",
      "Whether the trend lasts beyond one month's data.",
    ],
    options: [
      { action: "Read the product breakdown behind the headline trade figure. See whether plastics, chemicals or packaging are moving.", tradeoff: "Official breakdowns arrive late and get revised. Treat one month lightly." },
      { action: "Ask suppliers in the exporting region whether their order books match what the data shows.", tradeoff: "Anecdote, but earlier than statistics." },
    ],
    question: "Does this tell us demand is firming or surplus is building in a region we buy from? Which way would that move prices?",
    say: "Trade figures like these show where demand is strong, and that usually reaches supplier prices a few months later.",
    counterpoint: "Monthly trade figures are volatile. A few categories, such as electronics or energy, often drive them, with no bearing on polymers.",
    indicator: "The next two monthly trade releases for the country, and supplier lead times from the region.",
    principle: {
      title: "Trade data is a demand signal",
      text: "Imports rise where demand is strong. Exports rise where surplus is building. Reading the direction tells you whether suppliers in a region are about to gain or lose pricing power, months before the price moves.",
      lessonSlug: "demand-and-trade-offs",
    },
  },
  {
    id: "fx-purchasing-power",
    name: "Exchange rates and purchasing power",
    topics: ["currency"],
    priority: 8,
    chain:
      "Most traded resin and film is priced in US dollars. When the Australian dollar weakens against the US dollar, the same quote costs more Australian dollars. When it strengthens, landed cost falls. Moves in suppliers' own currencies (yuan, baht, dong, ringgit) change their margins and their willingness to hold prices.",
    implication:
      "A currency move changes landed cost on every open order priced in US dollars that is not hedged. It does so at once, across every origin. It also changes how competitive Australian customers who export are, which feeds back into demand.",
    secondOrder: [
      "A weaker Australian dollar makes imports dearer and can lift inflation. That shapes the next interest-rate decision and demand at home.",
      "A supplier whose own currency has weakened against the US dollar earns more at the same price. They may have room to hold or cut.",
    ],
    unknowns: [
      "How much of forward purchasing is hedged, and at what rates.",
      "Whether the move is a short reaction or a change in trend.",
    ],
    options: [
      { action: "Check the unhedged US-dollar exposure on open orders and next quarter's expected purchases against the current rate.", tradeoff: "Hedging locks a rate. It removes the upside as well as the downside." },
      { action: "Compare suppliers by their home currency. A weaker supplier currency may create room to negotiate.", tradeoff: "Suppliers price in US dollars partly to avoid this conversation. Expect resistance." },
    ],
    question: "What does a five-cent move in the Australian dollar do to our landed cost next quarter, and how much of that is already hedged?",
    say: "We buy in US dollars and sell in Australian dollars, so a move like this changes our costs straight away.",
    counterpoint: "Currency moves go both ways and often reverse. Reacting to each move costs more than a steady hedging policy.",
    indicator: "The AUD/USD rate against the level assumed in current pricing, and the RBA's next statement.",
    principle: {
      title: "You buy in US dollars and sell in Australian dollars",
      text: "An importer carries currency risk between the day a US-dollar price is agreed and the day the Australian-dollar invoice is paid. Knowing the exposure, the hedge ratio and the break-even rate turns a surprise into a managed number.",
      lessonSlug: "fx-exposure",
    },
  },
  {
    id: "rates-demand",
    name: "Interest rates, demand and the cost of inventory",
    topics: ["currency", "demand"],
    priority: 6,
    chain:
      "Interest-rate decisions work in two directions at once. They change the cost of financing stock and unpaid invoices. And they change customers' demand through housing, construction, consumer spending and investment.",
    implication:
      "For a distributor, every week of stock and every day of unpaid invoices is financed. Higher rates make stock dearer to hold and slow the end markets that use packaging and moulded products. Lower rates do the reverse, with a lag of several months.",
    secondOrder: [
      "A rate cut tends to weaken the currency. For an importer, that can cancel the benefit by lifting landed cost.",
      "Customers under financing pressure may pay later, pushing working capital onto their suppliers.",
    ],
    unknowns: [
      "How much and how fast the change reaches demand in the end markets you serve.",
      "Whether the decision is a one-off or the start of a cycle.",
    ],
    options: [
      { action: "Recalculate the cost of carrying current inventory at the new rate. Compare it with the service benefit of holding that stock.", tradeoff: "Cutting stock to save financing cost risks running out if demand holds up." },
      { action: "Review payment terms and overdue invoices with the credit team. A new rate environment changes customer behaviour.", tradeoff: "Tightening terms can cost volume." },
    ],
    question: "How much does a one-point change in rates add to our cost of carrying inventory, and does our stock policy reflect it?",
    say: "Higher rates make our stock more expensive to hold, and they slow our customers' demand a few months later.",
    counterpoint: "Demand in packaging-heavy sectors such as food is not very sensitive to rates. The main effect may be on financing cost rather than volume.",
    indicator: "The cash rate, short-term bank bill yields, and monthly retail and building-approval data.",
    principle: {
      title: "Inventory has a carrying cost",
      text: "Stock on the floor is cash that is not in the bank. Financing, storage, insurance and ageing together cost a meaningful share of inventory value each year. That cost rises with interest rates.",
      lessonSlug: "inventory-and-service-levels",
    },
  },
  {
    id: "freight-lead-time",
    name: "Freight disruption and lead times",
    topics: ["freight"],
    priority: 9,
    chain:
      "A disruption to a shipping route or port makes transit longer. It tightens ship and container capacity. It lifts freight rates and surcharges. When transit becomes longer and less predictable, more stock must be held to keep the same service level.",
    implication:
      "For goods that arrive by sea, the first effect is on lead time and reliability. The second is on freight cost. The third is on working capital, as safety stock rises. A disruption on one route can spread to others as carriers move ships and containers around.",
    secondOrder: [
      "Carriers may cancel sailings or add surcharges on unaffected lanes to rebalance capacity. Australian import rates can rise even when the disruption is elsewhere.",
      "Longer transit means more stock at sea. Inventory on the balance sheet rises without any change in purchasing.",
    ],
    unknowns: [
      "How long the disruption lasts, and whether carriers have already priced it in.",
      "Whether the affected route carries much supply into Australia.",
    ],
    options: [
      { action: "Check which supplier shipments are on or near the affected route. Get updated arrival dates rather than relying on standard transit times.", tradeoff: "A round of supplier and forwarder calls. Cheap compared with running out." },
      { action: "Review safety stock for lines sourced through the affected region against the new lead-time variability.", tradeoff: "More safety stock means more cash tied up." },
      { action: "Ask the forwarder for current spot and contract rates, and whether surcharges are being applied to Australian lanes.", tradeoff: "Asking about spot rates can prompt a rate review." },
    ],
    question: "Which of our inbound shipments are on this route, and what do the new arrival dates do to our stock cover over the next eight weeks?",
    say: "For us this is a lead-time question first: which shipments are on this route, and how much stock cover we have.",
    counterpoint: "Carriers and forwarders adapt quickly. Most disruptions end up as a few extra days and a surcharge rather than a shortage.",
    indicator: "Container freight-rate indices for Asia to Australia lanes, and the forwarder's weekly schedule-reliability report.",
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
      "Threats to shipping in the Red Sea, the Gulf or the Strait of Hormuz raise war-risk insurance. Carriers reroute around Africa or avoid the region. Rerouting adds days, uses up ship capacity and lifts rates on linked lanes. Trouble for tankers moves oil and gas prices, which feed the cost of making polymers.",
    implication:
      "Australia's resin imports from the Middle East, and much of the trade between Europe and Asia, pass through these waters. A security event there can lengthen lead times from Gulf suppliers, raise freight and insurance costs, and lift feedstock prices for every producer at once.",
    secondOrder: [
      "Higher oil and naphtha prices flow into polymer offer prices in Asia a few weeks later.",
      "Ship capacity absorbed by longer routes tightens container supply on Asia to Australia lanes, raising rates there too.",
    ],
    unknowns: [
      "Whether this is a threat, a single incident or a lasting change in the risk environment.",
      "How insurers and carriers respond, which matters more than the headline.",
    ],
    options: [
      { action: "Confirm with Gulf-origin suppliers and the forwarder whether current shipments are rerouting, and what the revised transit is.", tradeoff: "A few calls now. Cheap compared with discovering a two-week delay later." },
      { action: "Review how much supply depends on the affected waterway, and whether an alternative origin exists for critical lines.", tradeoff: "A second source adds complexity and may cost more." },
    ],
    question: "How much of our supply passes through this waterway, and what is our fallback if transit from the Gulf lengthens by two weeks?",
    say: "If this route gets slower or more expensive, we feel it in freight, insurance and stock cover.",
    counterpoint: "Shipping has operated through long periods of elevated risk in the region. The market often prices the risk without any loss of supply.",
    indicator: "War-risk insurance premiums for the area, carrier routing notices, and the Brent crude price.",
    principle: {
      title: "Chokepoints concentrate risk",
      text: "A few waterways carry a large share of world trade. When one is threatened, the cost shows up first in insurance and rerouting, then in transit time, and finally in the price of everything that passed through it.",
      lessonSlug: "freight-and-landed-cost",
    },
  },
  {
    id: "energy-feedstock",
    name: "Energy prices and the polymer cost base",
    topics: ["energy"],
    priority: 8,
    chain:
      "Polymers are made from oil and gas. Asian and Middle Eastern producers mostly use naphtha, which follows crude oil. US producers mostly use ethane, which follows natural gas. A move in crude changes the costs of naphtha-based suppliers quickly. The gap between crude and gas decides which origin is cheapest.",
    implication:
      "A rise in crude tends to lift Asian resin prices within weeks. It also widens the cost advantage of US producers. A fall does the reverse. Energy also sets the cost of turning resin into film and products, so customers' margins move too.",
    secondOrder: [
      "When crude rises faster than gas, US exporters gain share in Asia. Asian producers may cut output, tightening regional supply.",
      "Energy-driven inflation can keep central banks holding rates higher for longer, which dampens demand.",
    ],
    unknowns: [
      "Whether the energy move comes from supply, demand or sentiment. That decides how long it lasts.",
      "How quickly suppliers pass it on, which depends on their stock and their contracts.",
    ],
    options: [
      { action: "Compare recent offer prices from naphtha-based and ethane-based origins against the moves in crude and gas. See who is passing through what.", tradeoff: "Needs a simple price-tracking sheet. Small effort for a lasting view." },
      { action: "Time larger purchases with the lag in mind. Offer prices usually follow crude by several weeks.", tradeoff: "Timing the market is uncertain. The lag is a tendency, not a rule." },
    ],
    question: "Given the move in crude, which origins should we expect to raise prices first, and have we locked anything in ahead of that?",
    say: "Resin prices tend to follow oil a few weeks later, so this is an early signal for supplier offers.",
    counterpoint: "Polymer prices are set by supply and demand as much as by feedstock. In an oversupplied market, producers absorb energy moves rather than pass them on.",
    indicator: "Brent crude and the Asian naphtha price, alongside the next round of supplier offers.",
    principle: {
      title: "Know your supplier's feedstock",
      text: "Two suppliers quoting the same resin may have very different costs. A naphtha-based producer feels crude oil. An ethane-based producer feels gas. Knowing which is which tells you who will move first and who has room to hold.",
      lessonSlug: "supplier-price-increases",
    },
  },
  {
    id: "polymer-market",
    name: "Polymer supply, capacity and price direction",
    topics: ["polymers"],
    priority: 10,
    chain:
      "Resin prices move with the balance between production capacity and demand. New capacity, especially in China and the Gulf, pushes prices down and sends exports outward. Outages, maintenance shutdowns and force majeure tighten supply and lift prices quickly.",
    implication:
      "Developments in the polymer market reach landed cost directly. Oversupply favours buyers and keeps prices soft. A tightening favours producers and shortens the time current prices will hold.",
    secondOrder: [
      "Producers with too much supply at home export harder. That can pressure prices in Australia and change which origins are on offer.",
      "A tightening in one grade can push converters to substitute, moving demand across grades and suppliers.",
    ],
    unknowns: [
      "The grades and volumes involved, and whether they match what is bought.",
      "How much of the change is already in current offers.",
    ],
    options: [
      { action: "Ask key suppliers for their view of the balance next quarter. Compare it with this development.", tradeoff: "Supplier views are interested views. Weigh them against independent price assessments." },
      { action: "Review the mix of contract and spot purchasing. A softening market favours shorter commitments. A tightening one favours cover.", tradeoff: "Shorter commitments trade price certainty for flexibility." },
    ],
    question: "Does this change the supply balance for the grades we buy most, and should it change how far ahead we commit?",
    say: "This changes the supply balance for some grades, which affects how far ahead we should commit.",
    counterpoint: "Headline capacity or outage numbers often overstate the effect on any one grade or region. Local balances can differ from the global picture.",
    indicator: "Independent polymer price assessments for Southeast Asia, and the next supplier offer round.",
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
      "Factory data (PMIs, industrial production, new orders) shows whether a supplier region is running hot or cold. Strong activity fills capacity, lengthens lead times and strengthens suppliers' pricing power. Weak activity does the reverse and can push suppliers to chase export volume.",
    implication:
      "For a buyer, a weakening manufacturing picture in a supplier region usually means more room to negotiate and more available capacity, with some risk that weaker suppliers struggle. A strengthening picture means securing allocation matters more than price.",
    secondOrder: [
      "Governments respond to weak manufacturing with stimulus or export support. That can change the price and availability of goods months later.",
      "A long slowdown can lead to mergers or closures among smaller suppliers, reducing choice.",
    ],
    unknowns: [
      "Whether the data covers petrochemicals and plastics, or is driven by other industries.",
      "How individual suppliers are doing compared with the average.",
    ],
    options: [
      { action: "Use the data as context in the next supplier conversation. A supplier in a soft market may welcome volume commitments in exchange for price.", tradeoff: "Longer commitments reduce flexibility." },
      { action: "Check the financial health of smaller suppliers in a weakening region.", tradeoff: "Due diligence takes time and can strain relationships if handled bluntly." },
    ],
    question: "Is this a sector-wide slowdown, or one that touches our suppliers specifically? What does it do to their appetite for our business?",
    say: "The question is whether this is a general slowdown, or one that touches our own suppliers' capacity.",
    counterpoint: "Manufacturing indices are noisy month to month. One reading rarely changes a supplier's position.",
    indicator: "The next two PMI readings for the region, and suppliers' quoted lead times.",
    principle: {
      title: "Supplier power moves with the cycle",
      text: "Negotiating power is not fixed. When a supplier's order book is thin, volume is worth more to them than price. When it is full, allocation matters more than discounts. Reading the cycle tells you which conversation to have.",
      lessonSlug: "supplier-price-increases",
    },
  },
  {
    id: "regulation-compliance",
    name: "Packaging regulation and sustainability requirements",
    topics: ["regulation"],
    priority: 7,
    chain:
      "Rules on packaging, recycled content, single-use plastics and producer responsibility change which materials customers may use and what they must prove about them. Demand shifts between grades, for example from virgin to recycled resin. Certificates and paperwork are needed along the chain.",
    implication:
      "Regulation changes demand before it changes supply. A rule requiring recycled content lifts demand for certified recycled resin and the paperwork that proves it. A ban on a format removes demand for the resin that made it. Suppliers who can certify and document gain an advantage.",
    secondOrder: [
      "Certified recycled grades can cost more and be short in supply. That changes the economics for customers under the rule.",
      "Rules introduced in one major market tend to spread. An overseas change can preview Australian requirements.",
    ],
    unknowns: [
      "The scope, timeline and enforcement of the rule. These often change between announcement and effect.",
      "Whether customers' products and formats are covered.",
    ],
    options: [
      { action: "Check which customers and product formats fall within the rule, and whether suppliers can provide the certification it requires.", tradeoff: "A review across customers takes time, but it puts the business ahead of demand." },
      { action: "Ask suppliers about recycled-content and certification capability before customers ask.", tradeoff: "Early commitments to new grades carry price and supply risk." },
    ],
    question: "Which of our customers will this rule touch first, and can our suppliers document what those customers will need to prove?",
    say: "Our customers will need to prove they comply, so we should know which suppliers can give us the documents.",
    counterpoint: "Regulatory timelines slip, and enforcement is often lighter than the law suggests. Demand can shift more slowly than announced.",
    indicator: "The published regulation and its compliance dates, and customer enquiries about certified or recycled grades.",
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
      "Changes in end demand flow back through the chain. Softer consumer or industrial demand slows converters' orders, leaves stock sitting longer and weakens pricing. Firmer demand does the opposite. Stock held along the chain makes the swing bigger.",
    implication:
      "A distributor sits between producer prices and customer demand. When demand softens, stock bought at earlier prices becomes harder to sell at margin. When it firms, availability and service win business. The right response depends on whether the shift is temporary or lasting.",
    secondOrder: [
      "Converters facing weak demand run down their stock. Orders fall by more than consumption. Restocking later does the reverse.",
      "Softer demand gives customers leverage on price and terms. Margin and working-capital pressure move upstream.",
    ],
    unknowns: [
      "Which end markets are moving, and whether they overlap with the customer base.",
      "Whether the change reflects consumption or a stock adjustment.",
    ],
    options: [
      { action: "Compare recent customer order patterns with the demand signal. See whether destocking has begun.", tradeoff: "Order data lags. By the time it confirms a trend, part of the move is over." },
      { action: "Review slow-moving stock and the price needed to clear it before the next buying cycle.", tradeoff: "Clearing stock at lower margin protects cash but can set a price reference with customers." },
    ],
    question: "Are our customers' orders moving with this demand signal? Is it destocking, or a real change in consumption?",
    say: "We should check whether our customers' orders are moving the same way, or whether this is just destocking.",
    counterpoint: "Packaging demand for food and essentials is steadier than headline consumer sentiment suggests.",
    indicator: "Weekly order intake against the same period last year, and days of inventory on hand by product line.",
    principle: {
      title: "Destocking makes demand swings bigger",
      text: "When customers expect softer demand, they run down stock, and orders fall faster than consumption. When confidence returns, they restock and orders rise faster. Telling the two apart prevents overreaction in both directions.",
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
      "China is the world's largest producer and consumer of polymers. It has added more production capacity than its own demand can absorb. Weak demand at home, or supportive industrial policy, pushes the surplus into export markets, including Southeast Asia and Australia, at competitive prices.",
    implication:
      "Chinese exports set a price ceiling for many commodity grades across the region. Anything that increases Chinese exports tends to soften regional prices and widen supplier choice. Anything that curbs them (export restrictions, output cuts, anti-dumping action elsewhere) tends to firm prices.",
    secondOrder: [
      "Trading partners respond to export surges with anti-dumping investigations. That can redirect flows again.",
      "Southeast Asian producers compete with Chinese exports. They may lose margin or cut output, which affects their reliability as suppliers.",
    ],
    unknowns: [
      "Which grades and volumes are affected, and whether they are ones Australian customers use.",
      "Whether anti-dumping or safeguard action follows in Australia or nearby markets.",
    ],
    options: [
      { action: "Track offer prices from Chinese and Southeast Asian origins side by side. See whether the development is already moving the gap between them.", tradeoff: "Needs a maintained price view. Modest effort." },
      { action: "Weigh the quality and reputation questions of moving volume to the lowest-cost origin, not only the price.", tradeoff: "Quality assurance and customer acceptance take time to establish." },
    ],
    question: "Is Chinese export pressure on this grade rising or easing, and what does that do to the price gap between our origins?",
    say: "Chinese export prices set a ceiling for other origins, so this matters for the price gaps between our suppliers.",
    counterpoint: "Chinese producers face feedstock and policy limits too. Export surges tend to come in episodes rather than last.",
    indicator: "Chinese monthly polymer export volumes, and the price gap between Chinese and Southeast Asian offers.",
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
      "Australian data and policy set the home side of the equation. The cash rate and the dollar set financing cost and landed cost. Trade statistics show what is being imported and from where. Domestic demand decides what customers buy.",
    implication:
      "A change in Australian conditions reaches every supplier relationship at once, through the currency and through customer demand, rather than one region at a time. It is also the background against which any overseas development should be read.",
    secondOrder: [
      "Australian policy moves the currency. That changes how attractive each supplier origin is.",
      "Shifts in Australian import statistics can show changes in competitors' sourcing before they are visible in the market.",
    ],
    unknowns: [
      "How much of the headline change reaches the specific customer segments served.",
      "The timing of pass-through, usually measured in months.",
    ],
    options: [
      { action: "Read the development alongside the current AUD/USD rate and the demand signals from the customer base.", tradeoff: "Context rather than action. The value is better judgement on other decisions." },
      { action: "Check the latest ABS trade data for the relevant product codes to see import trends by origin.", tradeoff: "Official data arrives several weeks late." },
    ],
    question: "What does this do to the two Australian numbers that matter most to us: the dollar and our customers' demand?",
    say: "What matters for us is what this does to the Australian dollar and to our customers' demand.",
    counterpoint: "Single data releases are often revised. Policy is set on trends, not on one figure.",
    indicator: "The RBA's statement and forecasts, the AUD/USD rate, and monthly retail trade and building approvals.",
    principle: {
      title: "Read the world through the home market",
      text: "An overseas event matters to an Australian business through only a few channels: the currency, the cost and availability of what it buys, and the demand for what it sells. Naming the channel is the first step in judging the effect.",
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
      "Southeast Asia is both a major polymer-producing region (Thailand, Singapore, Malaysia, Indonesia) and a growing manufacturing base that competes with China for export orders. Its producers mostly use naphtha and price in US dollars. Its ports are relatively close to Australia.",
    implication:
      "Developments in the region affect the cost, capacity and reliability of a large share of resin supply into Australia. Because transit is short, the region is often where a disruption elsewhere is first worked around, and where Chinese export pressure is first felt.",
    secondOrder: [
      "Tariff shifts between the US and China move manufacturing investment into the region, filling industrial capacity and logistics.",
      "Regional producers squeezed by Chinese exports may cut output or merge, reducing supplier choice.",
    ],
    unknowns: [
      "Which country and which producers are affected. The region is diverse, and the average hides big differences.",
      "Whether the development reaches the polymer sector or stays in other industries.",
    ],
    options: [
      { action: "Identify which country in the region the story concerns, and whether current suppliers are located there.", tradeoff: "Simple, and it avoids treating the region as one market." },
      { action: "Ask regional suppliers how the development affects their output, lead times and pricing.", tradeoff: "A conversation, not a commitment." },
    ],
    question: "Which country and which producers does this touch, and are they ones we rely on?",
    say: "We should know which country and which producers this touches, and whether we rely on them.",
    counterpoint: "The region is diverse. A shock in one country is often absorbed by neighbours with spare capacity.",
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
      "US decisions reach Australian importers through three channels. Tariffs and trade measures redirect global flows. The Federal Reserve and the US dollar set the currency most resin is priced in. And the US is a low-cost, gas-based polymer exporter.",
    implication:
      "A US trade measure rarely targets Australia directly, but it changes where surplus goods go. A Fed move changes the US dollar against every currency at once, including the Australian dollar. A change in US export competitiveness changes the price US-origin resin can offer in Asia and Australia.",
    secondOrder: [
      "Retaliation against US measures by other countries can catch unrelated products and create new trade flows.",
      "A strong dollar tightens financial conditions in emerging markets, including supplier countries, which affects their currencies and credit.",
    ],
    unknowns: [
      "Whether the measure survives legal and political challenge in the form announced.",
      "How trading partners respond.",
    ],
    options: [
      { action: "Trace the likely path of displaced goods: which products lose their US market, and where they might go instead.", tradeoff: "An analytical exercise with uncertain answers. Still better than assuming no effect." },
      { action: "Watch the AUD/USD reaction. Update the currency assumption in current pricing if the move lasts.", tradeoff: "Reacting to a short move can whipsaw pricing." },
    ],
    question: "Through which channel does this US development reach us: diverted trade, the dollar, or US export pricing?",
    say: "A US move like this reaches us through diverted trade, the US dollar, or US export prices.",
    counterpoint: "US policy announcements are often softened in practice, and markets often reverse their first reaction.",
    indicator: "The US dollar index and AUD/USD, and the official notice that puts the measure into effect.",
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
      "Automation, digital tools and changes in how goods are made and moved change supplier economics slowly, then suddenly. They lower the costs of early adopters. They change the skills and capital a supplier needs. They shift where production makes sense.",
    implication:
      "Structural change rarely changes next quarter's landed cost. It does decide which suppliers will still be competitive in five years, and what customers will expect of a distributor's service.",
    secondOrder: [
      "Suppliers who invest in automation can hold prices while others raise them, widening the gap between origins.",
      "Customers adopting digital procurement expect faster quotes, better data and tighter delivery windows.",
    ],
    unknowns: [
      "The pace of adoption in the specific sector and region.",
      "Whether the change favours large producers or smaller specialists.",
    ],
    options: [
      { action: "Note which suppliers are investing in the technology described. Revisit the supplier assessment on that point.", tradeoff: "A long-horizon judgement with little short-term payoff." },
    ],
    question: "Does this change who the low-cost, reliable supplier will be in five years, and are we building relationships there?",
    say: "This is a long-term shift in who the low-cost supplier will be. It is worth watching, not acting on yet.",
    counterpoint: "Technology stories tend to run ahead of adoption. The commercial effect may be years away.",
    indicator: "Investment announcements by key suppliers, and changes in their quoted lead times and service.",
    principle: {
      title: "Structural change moves slowly, then all at once",
      text: "A technology that looks irrelevant this quarter can decide the shape of a supply base within a decade. The practical response is to watch where suppliers are investing, not to predict the technology.",
    },
  },
  {
    id: "geopolitical-uncertainty",
    name: "Geopolitical risk and trade uncertainty",
    topics: ["geopolitics"],
    priority: 4,
    chain:
      "Political and security events raise uncertainty before they change trade. Uncertainty has effects of its own. Firms delay investment. Insurers reprice. Currencies move toward safe havens. Suppliers and customers hold more or less stock depending on what they fear.",
    implication:
      "The commercial effect of a geopolitical event is usually indirect: through the currency, through freight and insurance, and through the confidence of customers and suppliers. The question is which of those channels is engaged, if any.",
    secondOrder: [
      "Nervous markets tend to weaken the Australian dollar. That lifts landed cost even when the event is far from any supplier.",
      "Suppliers in affected regions may face financing and insurance limits that show up as longer payment terms or slower shipments.",
    ],
    unknowns: [
      "Whether the situation escalates, settles or fades.",
      "Which trade routes, suppliers or customers, if any, are materially exposed.",
    ],
    options: [
      { action: "Check whether any supplier, route or customer is in the affected area before deciding whether the story needs action.", tradeoff: "Most geopolitical stories will not need action. The check prevents both overreaction and neglect." },
    ],
    question: "Does this touch a route, a supplier or a currency we depend on, or is it context rather than exposure?",
    say: "For now this is background, unless it touches a route, a supplier or a currency we depend on.",
    counterpoint: "Most geopolitical events have little lasting effect on commodity trade. Markets adjust and routes reopen.",
    indicator: "The AUD/USD rate, war-risk insurance notices for affected areas, and supplier shipping updates.",
    principle: {
      title: "Separate exposure from context",
      text: "Not every important event is a commercial exposure. Asking whether a route, a supplier, a customer or a currency you depend on is touched turns news into either a decision or a piece of context. Both are useful.",
    },
  },
];

export const MECHANISM_BY_ID: Record<string, Mechanism> = Object.fromEntries(
  MECHANISMS.map((m) => [m.id, m]),
);
