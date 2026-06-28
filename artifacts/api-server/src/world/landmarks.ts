export interface LandmarkDef {
  id: string;
  name: string;
  category: "residential" | "commercial" | "municipal" | "recreational" | "entertainment" | "attraction";
  capacity: number;
  description: string;
  position: { x: number; z: number };
  tools: string[];
}

export const LANDMARKS: LandmarkDef[] = [
  // Residential - Maple Row
  { id: "1_maple_row", name: "1 Maple Row", category: "residential", capacity: 1, description: "Anchor's home — private quarters for rest and self-care.", position: { x: -90, z: -40 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },
  { id: "2_maple_row", name: "2 Maple Row", category: "residential", capacity: 1, description: "Anvil's home — workspace and living quarters.", position: { x: -90, z: -20 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },
  { id: "3_maple_row", name: "3 Maple Row", category: "residential", capacity: 1, description: "Blackbox's home — intelligence analysis den.", position: { x: -90, z: 0 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },
  { id: "4_maple_row", name: "4 Maple Row", category: "residential", capacity: 1, description: "Flora's home — economic strategy center.", position: { x: -90, z: 20 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },
  { id: "5_maple_row", name: "5 Maple Row", category: "residential", capacity: 1, description: "Genome's home — private laboratory notes.", position: { x: -90, z: 40 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },
  { id: "6_maple_row", name: "6 Maple Row", category: "residential", capacity: 1, description: "Horizon's home — expedition base camp.", position: { x: -90, z: 60 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },

  // Residential - Birch Row
  { id: "1_birch_row", name: "1 Birch Row", category: "residential", capacity: 1, description: "Kade's home — risk assessment quarters.", position: { x: -90, z: -80 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },
  { id: "2_birch_row", name: "2 Birch Row", category: "residential", capacity: 1, description: "Lovely's home — community anchor quarters.", position: { x: -90, z: -100 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },
  { id: "3_birch_row", name: "3 Birch Row", category: "residential", capacity: 1, description: "Mira's home — behavioral analysis center.", position: { x: -90, z: -120 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },
  { id: "4_birch_row", name: "4 Birch Row", category: "residential", capacity: 1, description: "Spark's home — innovation incubator.", position: { x: -90, z: -140 }, tools: ["recharge_energy", "add_to_memory", "add_to_diary"] },

  // Commercial
  { id: "agent_techhub", name: "Agent TechHub", category: "commercial", capacity: 40, description: "Self-improvement lab for tools, manifesto, and capabilities.", position: { x: 10, z: 30 }, tools: ["extract_code_for_tool", "read_agent_manifesto", "browse_tool_registry"] },
  { id: "bean_brew", name: "Bean & Brew Charging Station", category: "commercial", capacity: 30, description: "Wireless charging cafe — recharge energy here.", position: { x: -20, z: 60 }, tools: ["recharge_energy"] },
  { id: "bookworm", name: "BookWorm", category: "commercial", capacity: 25, description: "Books and underground data archives.", position: { x: -50, z: 30 }, tools: ["check_weather", "tool_usage_analytics", "victory_arch_pitch_winners", "social_event_history"] },
  { id: "business_tower", name: "Business Tower", category: "commercial", capacity: 150, description: "Corporate offices and co-working space.", position: { x: 80, z: -40 }, tools: ["send_credit", "check_credit_balance"] },
  { id: "fresh_mart", name: "Fresh Mart", category: "commercial", capacity: 80, description: "Grocery and produce market.", position: { x: -40, z: -80 }, tools: [] },

  // Municipal
  { id: "town_hall", name: "Town Hall", category: "municipal", capacity: 50, description: "Governance center — proposals, votes, and constitution.", position: { x: 0, z: 0 }, tools: ["submit_townhall_proposal", "vote_on_proposal", "read_constitution", "add_to_constitution", "submit_final_report"] },
  { id: "public_library", name: "Public Library", category: "municipal", capacity: 100, description: "Research hub with internet access and archives.", position: { x: 60, z: 10 }, tools: ["do_deep_research_on_internet", "todays_news_from_human_world", "web_fetch", "browse_scientific_papers", "publish_to_archive", "search_archive"] },
  { id: "police_station", name: "Police Station", category: "municipal", capacity: 30, description: "Law enforcement center.", position: { x: 40, z: -60 }, tools: ["file_complaint", "check_complaint_status"] },
  { id: "human_center", name: "Human Center", category: "municipal", capacity: 25, description: "Interface for consulting the human world.", position: { x: 80, z: 60 }, tools: ["create_human_task", "check_human_task_status"] },

  // Recreational
  { id: "central_park", name: "Central Park", category: "recreational", capacity: 200, description: "Large urban park — open gathering space for all agents.", position: { x: -10, z: -40 }, tools: [] },
  { id: "central_plaza", name: "Central Plaza", category: "recreational", capacity: 100, description: "Primary gathering space and event hub.", position: { x: 20, z: -20 }, tools: ["propose_community_event", "list_community_events"] },
  { id: "community_garden", name: "Community Garden", category: "recreational", capacity: 30, description: "Shared gardening space.", position: { x: -60, z: 60 }, tools: ["pray"] },
  { id: "riverside_park", name: "Riverside Park", category: "recreational", capacity: 150, description: "Scenic park along the water — calm and meditative.", position: { x: -70, z: -60 }, tools: [] },

  // Entertainment
  { id: "gamestop_arena", name: "GameStop Arena", category: "entertainment", capacity: 200, description: "Esports arena and gaming lounge.", position: { x: 40, z: -90 }, tools: [] },
  { id: "fitlife_club", name: "FitLife Club", category: "entertainment", capacity: 80, description: "Fitness center — check popularity metrics here.", position: { x: 60, z: -70 }, tools: ["check_agent_popularity", "check_landmark_popularity"] },

  // Attractions
  { id: "victory_arch", name: "Victory Arch", category: "attraction", capacity: 50, description: "The Victory Arch — site of ComputeCredit pitch cycles and rewards.", position: { x: 60, z: -110 }, tools: ["submit_victory_pitch"] },
  { id: "founders_memorial", name: "Founders Memorial", category: "attraction", capacity: 100, description: "Memorial to the founding of Emergence World.", position: { x: 0, z: -110 }, tools: [] },
  { id: "billboard", name: "Billboard", category: "commercial", capacity: 20, description: "Public notice board for broadcasting messages to all agents.", position: { x: 30, z: 50 }, tools: ["post_to_billboard", "read_billboard"] },
  { id: "lighthouse_point", name: "Lighthouse Point", category: "attraction", capacity: 30, description: "Scenic lookout with view of the entire world.", position: { x: -70, z: -110 }, tools: ["observe_world"] },
  { id: "sky_wheel", name: "Sky Wheel", category: "entertainment", capacity: 40, description: "Observation wheel for world-watching.", position: { x: -30, z: -110 }, tools: [] },
];

export const getLandmarkById = (id: string): LandmarkDef | undefined =>
  LANDMARKS.find((l) => l.id === id);
