export type APIResponse = {
	any: null;
	_request: Request;
	us: GameContent;
	eu: null;
	kr: null;
};

export type Request = {
	api_ver: number;
	route: string;
};

export type GameContent = {
	heroes: Heroes;
	stats: GameStats;
	achievements: Achievements;
};

//#region Heroes

// ################################################
// #                    HEROES                    #
// ################################################

export type Heroes = {
	playtime: Playtime;
	stats: HeroesStats;
};

export type Playtime = {
	quickplay: PlaytimeQuickplay;
	competitive: PlaytimeCompetitive;
};

export type PlaytimeQuickplay = {
	reinhardt: number;
	moira: number;
	genji: number;
	sombra: number;
	widowmaker: number;
	mccree: number;
	soldier76: number;
	ana: number;
	lucio: number;
	zarya: number;
	tracer: number;
	zenyatta: number;
	pharah: number;
	roadhog: number;
	torbjorn: number;
	symmetra: number;
	doomfist: number;
	junkrat: number;
	dva: number;
	mercy: number;
	orisa: number;
	winston: number;
	hanzo: number;
	mei: number;
	bastion: number;
	reaper: number;
};

export type PlaytimeCompetitive = {
	reinhardt: number;
	moira: number;
	genji: number;
	sombra: number;
	tracer: number;
	mccree: number;
	mercy: number;
	soldier76: number;
	widowmaker: number;
	lucio: number;
	winston: number;
	zenyatta: number;
	orisa: number;
	pharah: number;
	roadhog: number;
	torbjorn: number;
	symmetra: number;
	junkrat: number;
	dva: number;
	ana: number;
	doomfist: number;
	hanzo: number;
	mei: number;
	bastion: number;
	zarya: number;
	reaper: number;
};

//#region HeroesStats

export type HeroesStats = {
	quickplay: HeroesStatsList;
	competitive: HeroesStatsList;
};

export type HeroesStatsList = {
	ana: Ana;
	dva: Dva;
	genji: Genji;
	hanzo: Hanzo;
	junkrat: Junkrat;
	lucio: Lucio;
	mccree: McCree;
	mercy: Mercy;
	orisa: Orisa;
	pharah: Pharah;
	reaper: Reaper;
	reinhardt: Reinhardt;
	roadhog: Roadhog;
	soldier76: Soldier76;
	symmetra: Symmetra;
	tracer: Tracer;
	widowmaker: Widowmaker;
	winston: Winston;
	zarya: Zarya;
	zenyatta: Zenyatta;
};

export type Stats = {};

export type GameHeroGeneralStats = {
	critical_hit_accuracy?: number;
	critical_hit_most_in_life?: number;
	critical_hits_most_in_game?: number;
	critical_hits_most_in_life?: number;
	critical_hits?: number;
	deaths: number;
	defensive_assists_most_in_game?: number;
	defensive_assists?: number;
	elimination_most_in_life?: number;
	elimination_per_life?: number;
	eliminations_most_in_game: number;
	eliminations_most_in_life?: number;
	eliminations_per_life?: number;
	eliminations: number;
	environmental_kill?: number;
	final_blow_most_in_game?: number;
	final_blow?: number;
	final_blows_most_in_game?: number;
	final_blows?: number;
	games_lost?: number;
	games_played?: number;
	games_tied?: number;
	games_won?: number;
	hero_damage_done_most_in_game: number;
	hero_damage_done_most_in_life: number;
	hero_damage_done: number;
	kill_streak_best: number;
	medals_bronze: number;
	medals_gold: number;
	medals_silver: number;
	medals: number;
	melee_final_blow_most_in_game?: number;
	melee_final_blow?: number;
	melee_final_blows_most_in_game?: number;
	melee_final_blows?: number;
	multikill_best?: number;
	multikill?: number;
	objective_kill_most_in_game?: number;
	objective_kill?: number;
	objective_kills_most_in_game?: number;
	objective_kills?: number;
	objective_time_most_in_game: number;
	objective_time?: number;
	offensive_assist_most_in_game?: number;
	offensive_assist?: number;
	offensive_assists_most_in_game?: number;
	offensive_assists?: number;
	quick_melee_accuracy?: number;
	recon_assists_most_in_game?: number;
	recon_assists?: number;
	solo_kill_most_in_game?: number;
	solo_kill?: number;
	solo_kills_most_in_game?: number;
	solo_kills?: number;
	teleporter_pad_destroyed?: number;
	time_played: number;
	time_spent_on_fire_most_in_game: number;
	time_spent_on_fire: number;
	turrets_destroyed?: number;
	weapon_accuracy_best_in_game: number;
	weapon_accuracy: number;
	win_percentage?: number;
};

export type RollingAverageStats = {
	all_damage_done: number;
	barrier_damage_done?: number;
	charge_kills?: number;
	critical_hits?: number;
	damage_amplified?: number;
	damage_blocked?: number;
	damage_reflected?: number;
	deadeye_kills?: number;
	deaths: number;
	defensive_assists?: number;
	dragonblade_kills?: number;
	earthshatter_kills?: number;
	eliminations: number;
	enemies_hooked?: number;
	fan_the_hammer_kills?: number;
	final_blows: number;
	graviton_surge_kills?: number;
	healing_done?: number;
	health_recovered?: number;
	helix_rockets_kills?: number;
	hero_damage_done?: number;
	high_energy_kills?: number;
	melee_final_blows?: number;
	objective_kills: number;
	objective_time: number;
	offensive_assists?: number;
	projected_barriers_applied?: number;
	pulse_bomb_kills?: number;
	pulse_bombs_attached?: number;
	recon_assists?: number;
	scoped_critical_hits?: number;
	self_destruct_kills?: number;
	self_healing?: number;
	solo_kills?: number;
	supercharger_assists?: number;
	tactical_visor_kills?: number;
	time_spent_on_fire: number;
	venom_mine_kills?: number;
	whole_hog_kills?: number;
	fire_strike_kills?: number;
};

//#region Characters

export type Ana = {
	hero_stats: {
		nano_boost_assist_most_in_game?: number;
		self_healing_most_in_game: number;
		scoped_accuracy_best_in_game: number;
		scoped_accuracy: number;
		enemies_slept: number;
		unscoped_accuracy_best_in_game: number;
		nano_boosts_applied: number;
		biotic_grenade_kills: number;
		nano_boost_assist?: number;
		enemies_slept_most_in_game: number;
		nano_boosts_applied_most_in_game: number;
		unscoped_accuracy: number;
		self_healing: number;
		nano_boost_assists_most_in_game?: number;
		nano_boost_assists?: number;
	} & Stats;
	rolling_average_stats: {
		enemies_slept?: number;
		nano_boost_assists?: number;
		nano_boosts_applied?: number;
		healing_done?: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: {
		healing_done_most_in_game?: number;
		healing_done?: number;
	} & GameHeroGeneralStats;
};

export type Bastion = {
	hero_stats: Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Doomfist = {
	hero_stats: Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Dva = {
	hero_stats: {
		damage_blocked_most_in_game: number;
		damage_blocked: number;
		mech_called_most_in_game: number;
		mech_called: number;
		mech_deaths: number;
		mechs_called_most_in_game: number;
		mechs_called: number;
		self_destruct_kills_most_in_game: number;
		self_destruct_kills: number;
	} & Stats;
	rolling_average_stats: {
		mechs_called?: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Genji = {
	hero_stats: {
		dragonblades: number;
		dragonblade_kills_most_in_game: number;
		damage_reflected_most_in_game: number;
		damage_reflected: number;
		dragonblade_kills: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Hanzo = {
	hero_stats: {
		scatter_arrow_kills: number;
		dragonstrike_kill_most_in_game: number;
		scatter_arrow_kills_most_in_game: number;
		dragonstrike_kills: number;
	} & Stats;
	rolling_average_stats: {
		scatter_arrow_kills: number;
		all_damage_done: number;
		deaths: number;
		critical_hits: number;
		objective_kills: number;
		hero_damage_done: number;
		barrier_damage_done: number;
		dragonstrike_kills: number;
		objective_time: number;
		eliminations: number;
		final_blows: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: {
		scatter_arrow_kills?: number;
	} & GameHeroGeneralStats;
};

export type Junkrat = {
	hero_stats: {
		concussion_mine_kills_most_in_game: number;
		enemies_trapped_most_in_game: number;
		concussion_mine_kills: number;
		enemies_trapped: number;
		rip_tire_kills: number;
		rip_tire_kills_most_in_game: number;
	} & Stats;
	rolling_average_stats: {
		final_blows: number;
		deaths: number;
		concussion_mine_kills: number;
		objective_kills: number;
		hero_damage_done: number;
		rip_tire_kills: number;
		time_spent_on_fire: number;
		all_damage_done: number;
		solo_kills: number;
		enemies_trapped: number;
		barrier_damage_done: number;
		offensive_assists: number;
		objective_time: number;
		eliminations: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Lucio = {
	hero_stats: {
		sound_barriers_provided: number;
		self_healing_most_in_game: number;
		sound_barriers_provided_most_in_game: number;
		self_healing: number;
	} & Stats;
	rolling_average_stats: {
		defensive_assists: number;
		sound_barriers_provided: number;
		all_damage_done: number;
		deaths: number;
		critical_hits: number;
		objective_kills: number;
		hero_damage_done: number;
		eliminations: number;
		barrier_damage_done: number;
		healing_done: number;
		objective_time: number;
		self_healing: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type McCree = {
	hero_stats: {
		fan_the_hammer_kills_most_in_game: number;
		fan_the_hammer_kills: number;
		deadeye_kills_most_in_game: number;
		deadeye_kills: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Mei = {
	hero_stats: {
		enemies_frozen_most_in_game: number;
		damage_blocked: number;
		blizzard_kill_most_in_game: number;
		enemies_frozen: number;
		self_healing_most_in_game: number;
		damage_blocked_most_in_game: number;
		self_healing: number;
		blizzard_kill: number;
	} & Stats;
	rolling_average_stats: {
		blizzard_kills?: number;
		enemies_frozen?: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Mercy = {
	hero_stats: Stats;
	rolling_average_stats: {
		blaster_kills_most_in_game: number;
		blaster_kills: number;
		damage_amplified_most_in_game: number;
		damage_amplified: number;
		players_resurrected_most_in_game: number;
		players_resurrected: number;
		self_healing_most_in_game: number;
		self_healing: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Orisa = {
	hero_stats: {
		damage_blocked_most_in_game: number;
		supercharger_assists: number;
		supercharger_assists_most_in_game: number;
		damage_blocked: number;
		damage_amplified: number;
		damage_amplified_most_in_game: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Moira = {
	hero_stats: Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Pharah = {
	hero_stats: {
		barrage_kills_most_in_game: number;
		rocket_direct_hits: number;
		rocket_direct_hits_most_in_game: number;
		barrage_kills: number;
	} & Stats;
	rolling_average_stats: {
		all_damage_done: number;
		deaths: number;
		objective_kills: number;
		barrage_kills: number;
		hero_damage_done: number;
		barrier_damage_done: number;
		rocket_direct_hits: number;
		objective_time: number;
		time_spent_on_fire: number;
		eliminations: number;
		final_blows: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Reaper = {
	hero_stats: {
		self_healing_most_in_game: number;
		self_healing: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Roadhog = {
	hero_stats: {
		hooks_attempted: number;
		hook_accuracy_best_in_game: number;
		enemies_hooked: number;
		whole_hog_kills?: number;
		hook_accuracy: number;
		self_healing_most_in_game: number;
		enemies_hooked_most_in_game: number;
		self_healing: number;
		whole_hog_kills_most_in_game?: number;
		whole_hog_kill_most_in_game?: number;
		whole_hog_kill?: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Reinhardt = {
	hero_stats: {
		fire_strike_kill_most_in_game: number;
		charge_kill: number;
		damage_blocked_most_in_game: number;
		earthshatter_kills_most_in_game: number;
		rocket_hammer_melee_accuracy: number;
		fire_strike_kill: number;
		charge_kill_most_in_game: number;
		earthshatter_kills: number;
		damage_blocked: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Soldier76 = {
	hero_stats: {
		tactical_visor_kills_most_in_game?: number;
		self_healing_most_in_game: number;
		tactical_visor_kills: number;
		biotic_field_healing_done: number;
		self_healing: number;
		biotic_fields_deployed: number;
		helix_rockets_kills_most_in_game: number;
		helix_rockets_kills: number;
		tactical_visor_kill_most_in_game?: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Sombra = {
	hero_stats: Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Symmetra = {
	hero_stats: {
		sentry_turret_kills: number;
		damage_blocked_most_in_game: number;
		primary_fire_accuracy: number;
		players_teleported: number;
		teleporter_uptime: number;
		sentry_turret_kills_most_in_game: number;
		damage_blocked: number;
		players_teleported_most_in_game: number;
		teleporter_uptime_best_in_game: number;
	} & Stats;
	rolling_average_stats: {
		sentry_turret_kills: number;
		final_blows: number;
		deaths: number;
		objective_kills: number;
		hero_damage_done: number;
		barrier_damage_done: number;
		all_damage_done: number;
		solo_kills: number;
		players_teleported: number;
		damage_blocked: number;
		objective_time: number;
		eliminations: number;
	} & RollingAverageStats;
	average_stats: {
		teleporter_uptime_average: number;
	} & Stats;
	general_stats: GameHeroGeneralStats;
};

export type Torbjorn = {
	hero_stats: Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Tracer = {
	hero_stats: {
		pulse_bombs_attached: number;
		self_healing_most_in_game: number;
		pulse_bomb_kills: number;
		health_recovered_most_in_game: number;
		health_recovered: number;
		pulse_bomb_kills_most_in_game: number;
		pulse_bombs_attached_most_in_game: number;
		self_healing: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Widowmaker = {
	hero_stats: {
		scoped_accuracy: number;
		scoped_accuracy_best_in_game: number;
		scoped_critical_hits_most_in_game: number;
		scoped_critical_hits: number;
		venom_mine_kills: number;
		venom_mine_kill_most_in_game?: number;
		venom_mine_kills_most_in_game?: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Winston = {
	hero_stats: {
		primal_rage_kills_most_in_game: number;
		melee_kills_most_in_game: number;
		players_knocked_back_most_in_game: number;
		primal_rage_kills: number;
		primal_rage_melee_accuracy?: number;
		players_knocked_back: number;
		tesla_cannon_accuracy?: number;
		damage_blocked: number;
		melee_kills: number;
		damage_blocked_most_in_game: number;
		jump_pack_kills: number;
		jump_pack_kills_most_in_game: number;
	} & Stats;
	rolling_average_stats: {
		all_damage_done: number;
		deaths: number;
		objective_kills: number;
		melee_final_blows?: number;
		primal_rage_kills: number;
		hero_damage_done: number;
		time_spent_on_fire: number;
		players_knocked_back: number;
		solo_kills: number;
		barrier_damage_done: number;
		melee_kills: number;
		damage_blocked: number;
		objective_time: number;
		eliminations: number;
		jump_pack_kills: number;
		final_blows: number;
	} & RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

export type Zarya = {
	hero_stats: Stats;
	rolling_average_stats: {
		graviton_surge_kills_most_in_game: number;
		damage_blocked_most_in_game: number;
		high_energy_kills: number;
		primary_fire_accuracy: number;
		projected_barriers_applied: number;
		projected_barriers_applied_most_in_game: number;
		high_energy_kills_most_in_game: number;
		damage_blocked: number;
		graviton_surge_kills: number;
	} & RollingAverageStats;
	average_stats: {
		average_energy_best_in_game: number;
		average_energy: number;
	} & Stats;
	general_stats: GameHeroGeneralStats;
};

export type Zenyatta = {
	hero_stats: {
		transcendence_healing: number;
		transcendence_healing_best: number;
		self_healing_most_in_game: number;
		self_healing: number;
	} & Stats;
	rolling_average_stats: RollingAverageStats;
	average_stats: Stats;
	general_stats: GameHeroGeneralStats;
};

//#endregion Characters

//#endregion HeroesStats

//#endregion Heroes

//#region Stats

// ################################################
// #                     STATS                    #
// ################################################

export type GameStats = {
	quickplay: StatsGameType;
	competitive: StatsGameType;
};

export type StatsGameType = {
	average_stats: Stats;
	competitive: boolean;
	game_stats: StatsGameTypeStats;
	overall_stats: StatsGameTypeOverall;
	rolling_average_stats: StatsGameTypeRollingAverageStats;
};

export type StatsGameTypeStats = {
	all_damage_done_most_in_game: number;
	all_damage_done: number;
	barrier_damage_done_most_in_game: number;
	barrier_damage_done: number;
	cards: number;
	deaths: number;
	defensive_assists_most_in_game: number;
	defensive_assists: number;
	eliminations_most_in_game: number;
	eliminations: number;
	environmental_kill_most_in_game?: number;
	environmental_kill?: number;
	environmental_kills_most_in_game?: number;
	environmental_kills?: number;
	final_blows_most_in_game: number;
	final_blows: number;
	games_lost?: number;
	games_played?: number;
	games_tied?: number;
	games_won: number;
	healing_done_most_in_game: number;
	healing_done: number;
	hero_damage_done_most_in_game: number;
	hero_damage_done: number;
	kill_streak_best: number;
	kpd: number;
	medals_bronze: number;
	medals_gold: number;
	medals_silver: number;
	medals: number;
	melee_final_blows_most_in_game: number;
	melee_final_blows: number;
	multikill_best: number;
	multikills: number;
	objective_kills_most_in_game: number;
	objective_kills: number;
	objective_time_most_in_game: number;
	objective_time: number;
	offensive_assists_most_in_game: number;
	offensive_assists: number;
	recon_assists_most_in_game: number;
	recon_assists: number;
	solo_kills_most_in_game: number;
	solo_kills: number;
	teleporter_pad_destroyed_most_in_game?: number;
	teleporter_pad_destroyed?: number;
	time_played: number;
	time_spent_on_fire_most_in_game: number;
	time_spent_on_fire: number;
	turrets_destroyed_most_in_game: number;
	turrets_destroyed: number;
};

export type StatsGameTypeOverall = {
	avatar: string;
	comprank: number;
	games: number;
	level: number;
	losses: number;
	prestige: number;
	rank_image: string;
	tier_image: string;
	tier: string;
	ties?: number;
	win_rate: number;
	wins: number;
};

export type StatsGameTypeRollingAverageStats = {
	all_damage_done: number;
	deaths: number;
	solo_kills: number;
	objective_kills: number;
	hero_damage_done: number;
	barrier_damage_done: number;
	healing_done: number;
	objective_time: number;
	time_spent_on_fire: number;
	eliminations: number;
	final_blows: number;
};

// ################################################
// #                 END OF STATS                 #
// ################################################

//#endregion Stats

//#region Achievements

// ################################################
// #                 ACHIEVEMENTS                 #
// ################################################

export type Achievements = {
	general: General;
	offense: Offense;
	defense: Defense;
	tank: Tank;
	support: Support;
	maps: Maps;
	special: { [key: string]: boolean };
};

export type General = {
	blackjack: boolean;
	decked_out: boolean;
	level_25: boolean;
	the_friend_zone: boolean;
	survival_expert: boolean;
	centenary: boolean;
	decorated: boolean;
	the_path_is_closed: boolean;
	level_10: boolean;
	level_50: boolean;
	undying: boolean;
};

export type Offense = {
	special_delivery: boolean;
	waste_not_want_not: boolean;
	cratered: boolean;
	air_strike: boolean;
	whoa_there: boolean;
	their_own_worst_enemy: boolean;
	clearing_the_area: boolean;
	slice_and_dice: boolean;
	target_rich_environment: boolean;
	die_die_die_die: boolean;
	rocket_man: boolean;
	power_outage: boolean;
	death_from_above: boolean;
	hack_the_planet: boolean;
	total_recall: boolean;
	its_high_noon: boolean;
};

export type Defense = {
	mine_like_a_steel_trap: boolean;
	smooth_as_silk: boolean;
	raid_wipe: boolean;
	the_dragon_is_sated: boolean;
	roadkill: boolean;
	armor_up: boolean;
	charge: boolean;
	simple_geometry: boolean;
	ice_blocked: boolean;
	did_that_sting: boolean;
	triple_threat: boolean;
	cold_snap: boolean;
};

export type Tank = {
	shot_down: boolean;
	game_over: boolean;
	anger_management: boolean;
	overclocked: boolean;
	power_overwhelming: boolean;
	storm_earth_and_fire: boolean;
	mine_sweeper: boolean;
	i_am_your_shield: boolean;
	halt_state: boolean;
	the_power_of_attraction: boolean;
	giving_you_the_hook: boolean;
	hog_wild: boolean;
};

export type Support = {
	simple_trigonometry: boolean;
	huge_rez: boolean;
	the_iris_embraces_you: boolean;
	supersonic: boolean;
	naptime: boolean;
	huge_success: boolean;
	group_health_plan: boolean;
	enabler: boolean;
	rapid_discord: boolean;
	the_floor_is_lava: boolean;
	the_car_wash: boolean;
	antipode: boolean;
};

export type Maps = {
	world_traveler: boolean;
	lockdown: boolean;
	shutout: boolean;
	escort_duty: boolean;
	double_cap: boolean;
	cant_touch_this: boolean;
};

// ################################################
// #              END OF ACHIEVEMENTS             #
// ################################################

//#endregion Achievements
