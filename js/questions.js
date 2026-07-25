/* Guess Your Party — question bank
   Each question:
   - id: unique key
   - category: topic label shown on the quiz screen
   - text: the policy statement, answered Yes / No / Unsure (one sentence, neutral wording)
   - rAnswer: which answer ('yes' | 'no') aligns with the Republican platform
              (the other answer aligns with the Democratic platform). This mapping
              is internal scoring only — never shown to the user during the quiz.
   - weight: 1 (mild), 2 (moderate), 3 (highly polarizing) — how much the question
             moves the needle and how likely it is to surface as a "top driver"
   - explanation: neutral, one-line description of what the question is really
                  asking, shown only on the results page
   - benefit: potential upside of the position, shown only on the results page
   - tradeoff: potential downside/cost of the position, shown only on the results page
   - impact: plain-language notes on taxes / spending / debt effects, shown on
             the results page for questions the user answered decisively
*/

// Maps each raw question category onto one of the 10 tracked "lean" buckets
// used for community analytics. Categories omitted here (AI Regulation, Free
// Speech, Social Media Regulation, Religious Liberty, States' Rights,
// Marijuana Legalization, Medical Transition for Minors) don't fit any bucket
// cleanly and are excluded from category-lean analysis.
const CATEGORY_LEAN_MAP = {
  "Taxes": "economy",
  "Government Spending": "economy",
  "National Debt": "economy",
  "Inflation": "economy",
  "Tariffs": "economy",
  "Size of the Federal Government": "economy",
  "Social Security": "economy",
  "Healthcare": "healthcare",
  "Medicare": "healthcare",
  "Immigration": "immigration",
  "Border Security": "immigration",
  "Birthright Citizenship": "immigration",
  "Gun Rights": "guns",
  "Abortion": "abortion",
  "Education": "education",
  "Public Education": "education",
  "School Choice": "education",
  "Parents' Rights in Schools": "education",
  "Domestic Energy Production": "energy",
  "Nuclear Energy": "energy",
  "Climate Policy": "energy",
  "Crime": "crime",
  "Criminal Justice": "crime",
  "Death Penalty": "crime",
  "Police Funding": "crime",
  "Foreign Policy": "foreignPolicy",
  "China": "foreignPolicy",
  "Ukraine": "foreignPolicy",
  "Foreign Aid": "foreignPolicy",
  "Mail-In Voting": "elections",
  "Voter ID": "elections",
  "Congressional Term Limits": "elections",
};

const QUESTIONS = [

  // ---------- Taxes ----------
  { id: "tax1", category: "Taxes", text: "Income tax rates should be lowered across the board.", rAnswer: "yes", weight: 2,
    explanation: "This asks whether federal income tax rates should generally go down for individuals.",
    benefit: "Leaves more take-home income with individuals and businesses.",
    tradeoff: "Broad rate cuts typically reduce federal revenue unless offset by spending cuts or growth.",
    impact: { taxes: "Lowers federal tax revenue.", spending: "No direct spending effect.", debt: "Tends to widen the deficit unless offset elsewhere." } },
  { id: "tax2", category: "Taxes", text: "Tax rates on income above $500,000 a year should be increased.", rAnswer: "no", weight: 3,
    explanation: "This asks about raising taxes specifically on very high earners.",
    benefit: "Raises additional federal revenue from the highest incomes.",
    tradeoff: "Critics argue it can reduce investment or business formation among top earners.",
    impact: { taxes: "Raises revenue from top earners.", spending: "Could fund existing or new programs.", debt: "Could modestly ease deficit pressure if enacted." } },

  // ---------- Government spending ----------
  { id: "spend1", category: "Government Spending", text: "Overall federal spending should be cut to help balance the budget.", rAnswer: "yes", weight: 2,
    explanation: "This asks about reducing total federal spending levels broadly.",
    benefit: "Can slow the growth of annual deficits.",
    tradeoff: "Spending cuts mean smaller or fewer federal programs and services.",
    impact: { taxes: "No direct tax effect.", spending: "Reduces federal outlays across programs.", debt: "Tends to slow the growth of the national debt." } },
  { id: "spend2", category: "Government Spending", text: "Non-defense federal spending should be capped to limit annual budget growth.", rAnswer: "yes", weight: 1,
    explanation: "This asks whether growth in non-military federal spending should be limited by law.",
    benefit: "Provides a predictable ceiling on future spending growth.",
    tradeoff: "Caps can limit the government's ability to respond to new needs or emergencies.",
    impact: { taxes: "No direct tax effect.", spending: "Slows growth in domestic program budgets.", debt: "Can ease long-run deficit pressure." } },

  // ---------- National debt ----------
  { id: "debt1", category: "National Debt", text: "Reducing the national debt should take priority over funding new federal programs.", rAnswer: "yes", weight: 2,
    explanation: "This asks how debt reduction should be weighed against new spending priorities.",
    benefit: "Prioritizing debt reduction can lower long-term interest costs.",
    tradeoff: "It can mean delaying or scaling back programs that address current needs.",
    impact: { taxes: "No direct tax effect.", spending: "Limits room for new program spending.", debt: "Directly aimed at slowing debt growth." } },

  // ---------- Inflation ----------
  { id: "infl1", category: "Inflation", text: "The federal government should send direct payments to households to help offset inflation.", rAnswer: "no", weight: 2,
    explanation: "This asks whether the government should provide direct financial relief during periods of high inflation.",
    benefit: "Can ease short-term financial strain on households.",
    tradeoff: "Direct payments can add to federal spending and, some economists argue, add upward pressure on prices.",
    impact: { taxes: "No direct tax effect.", spending: "Adds a new direct-payment program.", debt: "Increases near-term federal spending." } },

  // ---------- Healthcare ----------
  { id: "health1", category: "Healthcare", text: "The government should offer a public health insurance option available to everyone.", rAnswer: "no", weight: 3,
    explanation: "This asks about creating a government-run health insurance plan open to all Americans.",
    benefit: "Could expand coverage to people currently uninsured or underinsured.",
    tradeoff: "Would likely require significant new federal spending or revenue.",
    impact: { taxes: "Would likely require new or higher taxes to fund.", spending: "Significant increase in federal health spending.", debt: "Could raise the debt unless fully offset by new revenue." } },
  { id: "health2", category: "Healthcare", text: "Healthcare coverage decisions should be left mainly to private insurers and the free market.", rAnswer: "yes", weight: 2,
    explanation: "This asks whether the private insurance market, rather than government, should primarily shape healthcare coverage.",
    benefit: "Supporters say competition can improve choice and efficiency.",
    tradeoff: "Critics say it can leave coverage gaps for people who can't afford private plans.",
    impact: { taxes: "No direct tax effect.", spending: "Limits growth of federal health spending.", debt: "Generally seen as debt-neutral to debt-reducing." } },

  // ---------- Medicare ----------
  { id: "medicare1", category: "Medicare", text: "Medicare should be allowed to directly negotiate prescription drug prices with manufacturers.", rAnswer: "no", weight: 2,
    explanation: "This asks whether Medicare should negotiate drug prices the way many large private purchasers do.",
    benefit: "Could lower what Medicare and beneficiaries pay for medications.",
    tradeoff: "Some argue it could reduce drug manufacturers' incentive to develop new treatments.",
    impact: { taxes: "No direct tax effect.", spending: "Could lower federal drug spending over time.", debt: "Projected to modestly reduce federal health costs." } },

  // ---------- Social Security ----------
  { id: "ss1", category: "Social Security", text: "The retirement age for full Social Security benefits should be raised to keep the program solvent.", rAnswer: "yes", weight: 2,
    explanation: "This asks whether raising the retirement age is an acceptable way to address Social Security's long-term funding gap.",
    benefit: "Can improve the program's long-run financial solvency without new taxes.",
    tradeoff: "Means workers wait longer to receive full benefits.",
    impact: { taxes: "No direct tax effect.", spending: "Reduces future benefit payouts.", debt: "Improves Social Security's long-run solvency." } },

  // ---------- Immigration ----------
  { id: "imm1", category: "Immigration", text: "Undocumented immigrants who have lived in the U.S. for years without a criminal record should have a path to citizenship.", rAnswer: "no", weight: 3,
    explanation: "This asks about creating a legal pathway to citizenship for long-term undocumented residents without criminal records.",
    benefit: "Could bring more workers into the formal tax base and legal system.",
    tradeoff: "Critics argue it could encourage further unauthorized immigration.",
    impact: { taxes: "Could expand the tax base over time.", spending: "May require funding for processing and legal systems.", debt: "Economists are divided on the long-run fiscal effect." } },

  // ---------- Border security ----------
  { id: "border1", category: "Border Security", text: "The U.S. should increase funding for physical barriers and personnel along the southern border.", rAnswer: "yes", weight: 2,
    explanation: "This asks about increasing federal spending on border infrastructure and staffing.",
    benefit: "Supporters say it can reduce unauthorized crossings.",
    tradeoff: "Adds to federal infrastructure and enforcement costs.",
    impact: { taxes: "No direct tax effect.", spending: "Increases federal infrastructure and enforcement spending.", debt: "Adds modestly to federal outlays." } },

  // ---------- Birthright citizenship ----------
  { id: "birthright1", category: "Birthright Citizenship", text: "Children born on U.S. soil should automatically receive citizenship regardless of their parents' immigration status.", rAnswer: "no", weight: 3,
    explanation: "This asks about the current constitutional practice of granting citizenship to nearly everyone born in the U.S.",
    benefit: "Preserves a long-standing, easily administered citizenship rule.",
    tradeoff: "Changing it would likely require a constitutional or major legal challenge and new verification systems.",
    impact: { taxes: "No direct tax effect.", spending: "Changing the rule could add administrative and legal costs.", debt: "No significant direct effect." } },

  // ---------- Gun rights ----------
  { id: "gun1", category: "Gun Rights", text: "Background checks should be required for all gun purchases, including private sales.", rAnswer: "no", weight: 3,
    explanation: "This asks about extending background check requirements to private and unlicensed gun sales.",
    benefit: "Supporters say it can help keep guns from prohibited buyers.",
    tradeoff: "Critics say it adds friction and cost to lawful private transactions.",
    impact: { taxes: "No direct tax effect.", spending: "Minor increase in enforcement costs.", debt: "No significant effect." } },
  { id: "gun2", category: "Gun Rights", text: "Gun ownership rights should face minimal government restriction.", rAnswer: "yes", weight: 3,
    explanation: "This asks about the general level of restriction placed on gun ownership.",
    benefit: "Preserves broad individual access to firearms for self-defense and other lawful uses.",
    tradeoff: "Critics argue fewer restrictions can make it easier for firearms to reach people who shouldn't have them.",
    impact: { taxes: "No direct tax effect.", spending: "No significant effect.", debt: "No significant effect." } },

  // ---------- Crime ----------
  { id: "crime1", category: "Crime", text: "Nonviolent drug offenders should generally receive treatment programs rather than prison sentences.", rAnswer: "no", weight: 2,
    explanation: "This asks whether nonviolent drug offenses should be handled primarily through treatment rather than incarceration.",
    benefit: "Can reduce incarceration costs and address underlying substance use.",
    tradeoff: "Critics argue it may reduce deterrence for drug-related offenses.",
    impact: { taxes: "No direct tax effect.", spending: "Could shift spending from prisons to treatment programs.", debt: "Could modestly lower long-run incarceration costs." } },

  // ---------- Police funding ----------
  { id: "police1", category: "Police Funding", text: "Police departments should receive more funding and resources.", rAnswer: "yes", weight: 2,
    explanation: "This asks about increasing funding for local and federal law enforcement.",
    benefit: "Supporters say added resources can improve public-safety response and staffing.",
    tradeoff: "Increases public-safety spending at the local or federal level.",
    impact: { taxes: "No direct federal tax effect.", spending: "Increases local and federal public-safety spending.", debt: "Minor upward pressure if federally funded." } },

  // ---------- Death penalty ----------
  { id: "death1", category: "Death Penalty", text: "The federal death penalty should be abolished.", rAnswer: "no", weight: 2,
    explanation: "This asks whether capital punishment should remain available as a federal sentencing option.",
    benefit: "Abolishing it removes the risk of executing an innocent person and ends lengthy, costly appeals.",
    tradeoff: "Supporters of keeping it argue it serves as a deterrent and a proportional punishment for the most severe crimes.",
    impact: { taxes: "No direct tax effect.", spending: "Could reduce costs tied to long capital-case appeals.", debt: "No significant effect." } },

  // ---------- Abortion ----------
  { id: "abortion1", category: "Abortion", text: "Abortion access should be protected as a legal right nationwide.", rAnswer: "no", weight: 3,
    explanation: "This asks whether abortion access should be guaranteed by federal law across all states.",
    benefit: "Supporters say it ensures consistent access regardless of where someone lives.",
    tradeoff: "Critics argue it removes the decision from state and local governments.",
    impact: { taxes: "No direct tax effect.", spending: "No significant federal spending effect.", debt: "No significant effect." } },
  { id: "abortion2", category: "Abortion", text: "States should have the authority to restrict or ban abortion.", rAnswer: "yes", weight: 3,
    explanation: "This asks whether abortion policy should be set primarily at the state level.",
    benefit: "Supporters say it lets policy reflect the views of each state's residents.",
    tradeoff: "Critics say it creates inconsistent access depending on where someone lives.",
    impact: { taxes: "No direct tax effect.", spending: "No significant federal spending effect.", debt: "No significant effect." } },

  // ---------- Medical transition for minors ----------
  { id: "medtrans1", category: "Medical Transition for Minors", text: "Minors under 18 should be able to access medical treatments for gender transition with parental and medical provider consent.", rAnswer: "no", weight: 3,
    explanation: "This asks whether minors, with parental and medical sign-off, should be able to access gender-transition medical treatments.",
    benefit: "Supporters say it allows care decisions to be made by families together with medical providers.",
    tradeoff: "Critics argue minors may not be able to fully weigh long-term, potentially irreversible effects.",
    impact: { taxes: "No direct tax effect.", spending: "No significant federal spending effect.", debt: "No significant effect." } },

  // ---------- Parents' rights in schools ----------
  { id: "parents1", category: "Parents' Rights in Schools", text: "Parents should have the right to review and object to curriculum materials used in their child's public school.", rAnswer: "yes", weight: 2,
    explanation: "This asks about formal parental review and objection rights over public school curriculum.",
    benefit: "Gives parents more direct input into what their children are taught.",
    tradeoff: "Critics say it could complicate curriculum decisions or limit certain content for all students.",
    impact: { taxes: "No direct tax effect.", spending: "Minor administrative costs for schools.", debt: "No significant effect." } },

  // ---------- School choice ----------
  { id: "school1", category: "School Choice", text: "Public funding should support school choice, including vouchers usable at private schools.", rAnswer: "yes", weight: 2,
    explanation: "This asks about using public education dollars for vouchers that families can use at private schools.",
    benefit: "Gives families more options outside their assigned public school.",
    tradeoff: "Can redirect funding away from traditional public schools.",
    impact: { taxes: "No direct tax effect.", spending: "Redirects some public education dollars to private options.", debt: "No significant direct effect." } },

  // ---------- Public education ----------
  { id: "pubed1", category: "Public Education", text: "Federal funding for public K-12 schools should be increased.", rAnswer: "no", weight: 2,
    explanation: "This asks about increasing the federal government's share of public school funding.",
    benefit: "Could provide additional resources to public schools, particularly in lower-income areas.",
    tradeoff: "Increases federal education spending and may expand the federal role in local schooling.",
    impact: { taxes: "No direct tax effect.", spending: "Increases federal education spending.", debt: "Modest upward pressure if not offset." } },

  // ---------- Religious liberty ----------
  { id: "religion1", category: "Religious Liberty", text: "Religious organizations and business owners should be exempt from certain laws when compliance would conflict with their religious beliefs.", rAnswer: "yes", weight: 2,
    explanation: "This asks about granting religious exemptions from some general laws, such as anti-discrimination requirements.",
    benefit: "Supporters say it protects religious practice and conscience.",
    tradeoff: "Critics say it can create exceptions to protections others rely on.",
    impact: { taxes: "No direct tax effect.", spending: "No significant effect.", debt: "No significant effect." } },

  // ---------- Free speech ----------
  { id: "speech1", category: "Free Speech", text: "Social media platforms should be barred from removing legal but controversial content.", rAnswer: "yes", weight: 2,
    explanation: "This asks whether platforms should be legally restricted from moderating lawful but controversial speech.",
    benefit: "Supporters say it protects a wide range of viewpoints from private censorship.",
    tradeoff: "Critics say it could limit platforms' ability to manage harassment or harmful content.",
    impact: { taxes: "No direct tax effect.", spending: "Minor regulatory and enforcement costs.", debt: "No significant effect." } },

  // ---------- Social media regulation ----------
  { id: "socmed1", category: "Social Media Regulation", text: "The federal government should more strictly regulate social media companies to address misinformation and harmful content.", rAnswer: "no", weight: 2,
    explanation: "This asks about expanding federal regulatory authority over social media content and practices.",
    benefit: "Supporters say it could reduce the spread of harmful or false content.",
    tradeoff: "Critics say it risks government overreach into what speech is allowed online.",
    impact: { taxes: "No direct tax effect.", spending: "Minor increase in regulatory agency costs.", debt: "No significant effect." } },

  // ---------- AI regulation ----------
  { id: "ai1", category: "AI Regulation", text: "The federal government should create new regulations specifically governing the development and use of artificial intelligence.", rAnswer: "no", weight: 2,
    explanation: "This asks about establishing new federal rules specifically targeting AI development and deployment.",
    benefit: "Supporters say it could get ahead of safety, privacy, or labor-market risks.",
    tradeoff: "Critics say new rules could slow innovation or be difficult to enforce given how fast the technology changes.",
    impact: { taxes: "No direct tax effect.", spending: "Requires funding for a new regulatory function.", debt: "No significant direct effect." } },

  // ---------- Marijuana legalization ----------
  { id: "drug1", category: "Marijuana Legalization", text: "Marijuana should be legalized at the federal level.", rAnswer: "no", weight: 2,
    explanation: "This asks whether marijuana should be legal under federal law, as it already is in many states.",
    benefit: "Could create new federal excise tax revenue and reduce enforcement costs.",
    tradeoff: "Critics raise public-health and regulatory concerns about broader legal access.",
    impact: { taxes: "Could create new excise tax revenue.", spending: "Could reduce federal enforcement costs.", debt: "Likely a modest net positive for federal revenue." } },

  // ---------- Domestic energy production ----------
  { id: "energy1", category: "Domestic Energy Production", text: "Domestic oil and gas drilling should be expanded to boost energy independence.", rAnswer: "yes", weight: 2,
    explanation: "This asks about expanding domestic fossil fuel production.",
    benefit: "Can generate federal lease and royalty revenue and reduce reliance on imported energy.",
    tradeoff: "Critics raise environmental and long-term climate concerns.",
    impact: { taxes: "No direct tax effect.", spending: "Minimal direct spending effect.", debt: "Neutral to modestly positive for federal revenue." } },

  // ---------- Climate policy ----------
  { id: "climate1", category: "Climate Policy", text: "The government should prioritize renewable energy development over fossil fuel production.", rAnswer: "no", weight: 3,
    explanation: "This asks whether federal energy policy should favor renewables over fossil fuels.",
    benefit: "Supporters say it can reduce long-term emissions and diversify energy sources.",
    tradeoff: "Can involve near-term subsidy and infrastructure costs.",
    impact: { taxes: "May involve new incentives or credits.", spending: "Increases clean-energy subsidies and infrastructure spending.", debt: "Could add to near-term spending; supporters cite long-run savings." } },

  // ---------- Nuclear energy ----------
  { id: "nuclear1", category: "Nuclear Energy", text: "The federal government should support expanding nuclear power as part of the U.S. energy mix.", rAnswer: "yes", weight: 1,
    explanation: "This asks about federal support for growing nuclear power generation.",
    benefit: "Nuclear power provides steady, low-emission electricity generation.",
    tradeoff: "New plants involve high upfront costs and long construction timelines.",
    impact: { taxes: "No direct tax effect.", spending: "May involve federal loan guarantees or incentives.", debt: "Modest, depending on the scale of federal support." } },

  // ---------- Foreign aid ----------
  { id: "aid1", category: "Foreign Aid", text: "The U.S. should reduce spending on foreign aid to focus more resources domestically.", rAnswer: "yes", weight: 2,
    explanation: "This asks whether foreign aid spending should be reduced in favor of domestic priorities.",
    benefit: "Could free up federal resources for domestic programs.",
    tradeoff: "Critics say reduced aid can weaken U.S. influence and diplomatic relationships abroad.",
    impact: { taxes: "No direct tax effect.", spending: "Reduces a relatively small share of the federal budget.", debt: "Minor effect on the overall federal budget." } },

  // ---------- Ukraine ----------
  { id: "ukraine1", category: "Ukraine", text: "The U.S. should continue providing significant military aid to Ukraine in its conflict with Russia.", rAnswer: "no", weight: 2,
    explanation: "This asks about the U.S. continuing substantial military assistance to Ukraine.",
    benefit: "Supporters say it helps a partner nation and signals resolve to other countries.",
    tradeoff: "Involves ongoing federal spending and debate over long-term U.S. commitments abroad.",
    impact: { taxes: "No direct tax effect.", spending: "Involves ongoing military aid spending.", debt: "Adds to federal outlays while aid continues." } },

  // ---------- China ----------
  { id: "china1", category: "China", text: "The U.S. should take a more confrontational approach toward China on trade and security issues.", rAnswer: "yes", weight: 1,
    explanation: "This asks about the general posture the U.S. should take toward China on trade and security.",
    benefit: "Supporters say a firmer stance can protect U.S. industries and security interests.",
    tradeoff: "Critics warn it could raise costs for businesses and consumers and strain diplomatic ties.",
    impact: { taxes: "No direct tax effect.", spending: "Could involve added defense or enforcement costs.", debt: "Indirect, long-term economic effects." } },

  // ---------- Tariffs ----------
  { id: "tariff1", category: "Tariffs", text: "The U.S. should impose tariffs on imported goods to protect domestic industries.", rAnswer: "yes", weight: 2,
    explanation: "This asks about using tariffs on imports as a tool to protect domestic producers.",
    benefit: "Can shield domestic industries from foreign competition and generate federal revenue.",
    tradeoff: "Tariffs often raise costs for importers and, in turn, consumers.",
    impact: { taxes: "Tariffs act as a tax on imports, raising some consumer costs.", spending: "No direct spending effect.", debt: "Generates some federal revenue." } },

  // ---------- Voter ID ----------
  { id: "voterid1", category: "Voter ID", text: "States should require a government-issued photo ID to vote.", rAnswer: "yes", weight: 2,
    explanation: "This asks about requiring photo identification as a condition of voting.",
    benefit: "Supporters say it helps verify voter identity and confidence in elections.",
    tradeoff: "Critics say it can create an added barrier for some eligible voters who lack ID.",
    impact: { taxes: "No direct federal tax effect.", spending: "Minor state administrative costs.", debt: "No significant effect." } },

  // ---------- Mail-in voting ----------
  { id: "mailin1", category: "Mail-In Voting", text: "Mail-in voting should be expanded and made easier to access nationwide.", rAnswer: "no", weight: 2,
    explanation: "This asks about expanding access to mail-in ballots as a standard voting option.",
    benefit: "Supporters say it increases convenience and can raise voter turnout.",
    tradeoff: "Critics raise concerns about verification and election administration at scale.",
    impact: { taxes: "No direct tax effect.", spending: "Minor state administrative costs.", debt: "No significant effect." } },

  // ---------- Congressional term limits ----------
  { id: "termlimits1", category: "Congressional Term Limits", text: "Term limits should be imposed on members of Congress.", rAnswer: "yes", weight: 1,
    explanation: "This asks about capping the number of terms a member of Congress can serve.",
    benefit: "Supporters say it brings in new perspectives and reduces career politicians.",
    tradeoff: "Critics say it can reduce institutional experience and expertise in Congress.",
    impact: { taxes: "No direct tax effect.", spending: "No significant effect.", debt: "No significant effect." } },

  // ---------- States' rights ----------
  { id: "states1", category: "States' Rights", text: "Most policy decisions on social issues should be left to individual states rather than decided at the federal level.", rAnswer: "yes", weight: 2,
    explanation: "This asks about the general balance of power between federal and state governments on social policy.",
    benefit: "Allows policy to more closely reflect the preferences of each state's residents.",
    tradeoff: "Can lead to significant policy differences for the same issue depending on where someone lives.",
    impact: { taxes: "No direct tax effect.", spending: "No significant direct effect.", debt: "No significant effect." } },

  // ---------- Size of the federal government ----------
  { id: "govsize1", category: "Size of the Federal Government", text: "The number of federal agencies and federal employees should be reduced.", rAnswer: "yes", weight: 2,
    explanation: "This asks about reducing the overall scale of the federal government's workforce and agencies.",
    benefit: "Supporters say it can lower administrative costs and government overhead.",
    tradeoff: "Critics say it can reduce the government's capacity to deliver services and oversight.",
    impact: { taxes: "No direct tax effect.", spending: "Reduces federal payroll and administrative spending.", debt: "Can ease long-run spending pressure." } },

  // ---------- Extra coverage (defense/foreign policy, education, criminal justice) ----------
  { id: "defense1", category: "Foreign Policy", text: "The U.S. should prioritize maintaining strong international alliances like NATO, even when it's costly.", rAnswer: "no", weight: 1,
    explanation: "This asks how much priority the U.S. should place on funding and maintaining international alliances.",
    benefit: "Supporters say alliances strengthen collective security and shared burden.",
    tradeoff: "Involves ongoing financial and military commitments.",
    impact: { taxes: "No direct tax effect.", spending: "Involves ongoing commitments and aid spending.", debt: "Modest, ongoing effect." } },
  { id: "loans1", category: "Education", text: "Federal student loan debt should be broadly forgiven.", rAnswer: "no", weight: 3,
    explanation: "This asks about broad, government-funded forgiveness of federal student loan balances.",
    benefit: "Would reduce the debt burden on borrowers who took out federal student loans.",
    tradeoff: "Represents a direct cost to the federal government, borne by taxpayers.",
    impact: { taxes: "No direct tax effect.", spending: "One-time or ongoing cost to the federal government.", debt: "Adds directly to near-term federal costs." } },
  { id: "sentencing1", category: "Criminal Justice", text: "Mandatory minimum prison sentences should be reduced in favor of judicial discretion.", rAnswer: "no", weight: 2,
    explanation: "This asks whether judges should have more flexibility to set sentences instead of following fixed minimums.",
    benefit: "Can allow sentencing to better reflect the specifics of each case.",
    tradeoff: "Critics say it can lead to inconsistent sentencing across cases.",
    impact: { taxes: "No direct tax effect.", spending: "Could lower long-run incarceration costs.", debt: "Minor, long-term effect." } },
];
