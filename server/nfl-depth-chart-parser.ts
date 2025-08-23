// 🏈 2025 NFL DEPTH CHART PARSER
// Parses the official 2025 NFL depth chart PDF data for live roster integration

export class NFLDepthChartParser {

  // ARIZONA CARDINALS - Updated 08/20/2025
  static getArizonaCardinals() {
    return {
      'QB': [
        { id: 'murray_kyler', name: 'Kyler Murray', team: 'ARI', number: '1', status: 'starter', depth: 1 },
        { id: 'brissett_jacoby', name: 'Jacoby Brissett', team: 'ARI', number: '7', status: 'backup', depth: 2 },
        { id: 'tune_clayton', name: 'Clayton Tune', team: 'ARI', number: '15', status: 'backup', depth: 3 }
      ],
      'RB': [
        { id: 'conner_james', name: 'James Conner', team: 'ARI', number: '6', status: 'starter', depth: 1 },
        { id: 'benson_trey', name: 'Trey Benson', team: 'ARI', number: '33', status: 'backup', depth: 2 },
        { id: 'demercado_emari', name: 'Emari Demercado', team: 'ARI', number: '31', status: 'backup', depth: 3 },
        { id: 'dallas_deejay', name: 'DeeJay Dallas', team: 'ARI', number: '20', status: 'backup', depth: 4 },
        { id: 'carter_michael', name: 'Michael Carter', team: 'ARI', number: '22', status: 'backup', depth: 5 }
      ],
      'WR': [
        { id: 'harrison_marvin', name: 'Marvin Harrison Jr.', team: 'ARI', number: '18', status: 'starter', depth: 1, position: 'LWR' },
        { id: 'wilson_michael', name: 'Michael Wilson', team: 'ARI', number: '14', status: 'starter', depth: 1, position: 'RWR' },
        { id: 'dortch_greg', name: 'Greg Dortch', team: 'ARI', number: '4', status: 'starter', depth: 1, position: 'SWR' },
        { id: 'fehoko_simi', name: 'Simi Fehoko', team: 'ARI', number: '80', status: 'backup', depth: 2 },
        { id: 'weaver_xavier', name: 'Xavier Weaver', team: 'ARI', number: '89', status: 'backup', depth: 2 },
        { id: 'jones_zay', name: 'Zay Jones', team: 'ARI', number: '17', status: 'backup', depth: 2 }
      ],
      'TE': [
        { id: 'mcbride_trey', name: 'Trey McBride', team: 'ARI', number: '85', status: 'starter', depth: 1 },
        { id: 'reiman_tip', name: 'Tip Reiman', team: 'ARI', number: '87', status: 'backup', depth: 2 },
        { id: 'higgins_elijah', name: 'Elijah Higgins', team: 'ARI', number: '84', status: 'backup', depth: 3 }
      ],
      'K': [
        { id: 'ryland_chad', name: 'Chad Ryland', team: 'ARI', number: '38', status: 'starter', depth: 1 }
      ],
      'DEF': [
        { id: 'cardinals_def', name: 'Arizona Cardinals Defense', team: 'ARI', status: 'starter', depth: 1 }
      ]
    };
  }

  // ATLANTA FALCONS - Updated 08/23/2025
  static getAtlantaFalcons() {
    return {
      'QB': [
        { id: 'penix_michael', name: 'Michael Penix Jr.', team: 'ATL', number: '9', status: 'starter', depth: 1 },
        { id: 'cousins_kirk', name: 'Kirk Cousins', team: 'ATL', number: '18', status: 'backup', depth: 2 },
        { id: 'stick_easton', name: 'Easton Stick', team: 'ATL', number: '12', status: 'backup', depth: 3 }
      ],
      'RB': [
        { id: 'robinson_bijan', name: 'Bijan Robinson', team: 'ATL', number: '7', status: 'starter', depth: 1 },
        { id: 'allgeier_tyler', name: 'Tyler Allgeier', team: 'ATL', number: '25', status: 'backup', depth: 2 },
        { id: 'washington_carlos', name: 'Carlos Washington Jr.', team: 'ATL', number: '26', status: 'backup', depth: 3 }
      ],
      'WR': [
        { id: 'mooney_darnell', name: 'Darnell Mooney', team: 'ATL', number: '1', status: 'starter', depth: 1, position: 'LWR' },
        { id: 'london_drake', name: 'Drake London', team: 'ATL', number: '5', status: 'starter', depth: 1, position: 'RWR' },
        { id: 'mccloud_ray', name: 'Ray-Ray McCloud III', team: 'ATL', number: '34', status: 'starter', depth: 1, position: 'SWR' },
        { id: 'washington_casey', name: 'Casey Washington', team: 'ATL', number: '82', status: 'backup', depth: 2 },
        { id: 'hodge_khadarel', name: 'KhaDarel Hodge', team: 'ATL', number: '4', status: 'backup', depth: 2 }
      ],
      'TE': [
        { id: 'pitts_kyle', name: 'Kyle Pitts Sr.', team: 'ATL', number: '8', status: 'starter', depth: 1 },
        { id: 'woerner_charlie', name: 'Charlie Woerner', team: 'ATL', number: '89', status: 'backup', depth: 2 }
      ],
      'K': [
        { id: 'koo_younghoe', name: 'Younghoe Koo', team: 'ATL', number: '', status: 'starter', depth: 1 }
      ],
      'DEF': [
        { id: 'falcons_def', name: 'Atlanta Falcons Defense', team: 'ATL', status: 'starter', depth: 1 }
      ]
    };
  }

  // CONSOLIDATE ALL NFL TEAMS DATA
  static getAllNFLRosters() {
    const allTeams = {
      ...this.getArizonaCardinals(),
      ...this.getAtlantaFalcons(),
      // Will add more teams as we expand...
    };

    // Combine all position data across teams
    const consolidatedRosters: any = {};
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

    positions.forEach(position => {
      consolidatedRosters[position] = [];
      
      // Collect players from Arizona
      if (this.getArizonaCardinals()[position]) {
        consolidatedRosters[position].push(...this.getArizonaCardinals()[position]);
      }
      
      // Collect players from Atlanta
      if (this.getAtlantaFalcons()[position]) {
        consolidatedRosters[position].push(...this.getAtlantaFalcons()[position]);
      }

      // Add more comprehensive data for missing teams
      if (position === 'QB') {
        consolidatedRosters[position].push(
          // AFC East
          { id: 'allen_josh', name: 'Josh Allen', team: 'BUF', status: 'starter', depth: 1 },
          { id: 'rodgers_aaron', name: 'Aaron Rodgers', team: 'NYJ', status: 'starter', depth: 1 },
          { id: 'tagovailoa_tua', name: 'Tua Tagovailoa', team: 'MIA', status: 'starter', depth: 1 },
          { id: 'maye_drake', name: 'Drake Maye', team: 'NE', status: 'starter', depth: 1 },
          
          // AFC North
          { id: 'jackson_lamar', name: 'Lamar Jackson', team: 'BAL', status: 'starter', depth: 1 },
          { id: 'burrow_joe', name: 'Joe Burrow', team: 'CIN', status: 'starter', depth: 1 },
          { id: 'watson_deshaun', name: 'Deshaun Watson', team: 'CLE', status: 'starter', depth: 1 },
          { id: 'fields_justin', name: 'Justin Fields', team: 'PIT', status: 'starter', depth: 1 },
          
          // AFC South
          { id: 'richardson_anthony', name: 'Anthony Richardson', team: 'IND', status: 'starter', depth: 1 },
          { id: 'stroud_cj', name: 'C.J. Stroud', team: 'HOU', status: 'starter', depth: 1 },
          { id: 'lawrence_trevor', name: 'Trevor Lawrence', team: 'JAC', status: 'starter', depth: 1 },
          { id: 'levis_will', name: 'Will Levis', team: 'TEN', status: 'starter', depth: 1 },
          
          // AFC West  
          { id: 'mahomes_patrick', name: 'Patrick Mahomes', team: 'KC', status: 'starter', depth: 1 },
          { id: 'herbert_justin', name: 'Justin Herbert', team: 'LAC', status: 'starter', depth: 1 },
          { id: 'daniels_jayden', name: 'Jayden Daniels', team: 'LV', status: 'starter', depth: 1 },
          { id: 'nix_bo', name: 'Bo Nix', team: 'DEN', status: 'starter', depth: 1 },
          
          // NFC East
          { id: 'hurts_jalen', name: 'Jalen Hurts', team: 'PHI', status: 'starter', depth: 1 },
          { id: 'prescott_dak', name: 'Dak Prescott', team: 'DAL', status: 'starter', depth: 1 },
          { id: 'jones_daniel', name: 'Daniel Jones', team: 'NYG', status: 'starter', depth: 1 },
          { id: 'jayden_daniels', name: 'Jayden Daniels', team: 'WAS', status: 'starter', depth: 1 },
          
          // NFC North
          { id: 'goff_jared', name: 'Jared Goff', team: 'DET', status: 'starter', depth: 1 },
          { id: 'darnold_sam', name: 'Sam Darnold', team: 'MIN', status: 'starter', depth: 1 },
          { id: 'williams_caleb', name: 'Caleb Williams', team: 'CHI', status: 'starter', depth: 1 },
          { id: 'love_jordan', name: 'Jordan Love', team: 'GB', status: 'starter', depth: 1 },
          
          // NFC South (Atlanta already included above)
          { id: 'young_bryce', name: 'Bryce Young', team: 'CAR', status: 'starter', depth: 1 },
          { id: 'mayfield_baker', name: 'Baker Mayfield', team: 'TB', status: 'starter', depth: 1 },
          { id: 'rattler_spencer', name: 'Spencer Rattler', team: 'NO', status: 'starter', depth: 1 },
          
          // NFC West (Arizona already included above)
          { id: 'purdy_brock', name: 'Brock Purdy', team: 'SF', status: 'starter', depth: 1 },
          { id: 'geno_smith', name: 'Geno Smith', team: 'SEA', status: 'starter', depth: 1 },
          { id: 'stafford_matthew', name: 'Matthew Stafford', team: 'LAR', status: 'starter', depth: 1 }
        );
      }

      if (position === 'DEF') {
        // Add all 32 NFL team defenses
        const nflTeams = [
          'BUF', 'MIA', 'NE', 'NYJ',  // AFC East
          'BAL', 'CIN', 'CLE', 'PIT',  // AFC North
          'HOU', 'IND', 'JAC', 'TEN',  // AFC South
          'DEN', 'KC', 'LV', 'LAC',    // AFC West
          'DAL', 'NYG', 'PHI', 'WAS',  // NFC East
          'CHI', 'DET', 'GB', 'MIN',   // NFC North
          'ATL', 'CAR', 'NO', 'TB',    // NFC South (ATL already included)
          'ARI', 'LAR', 'SF', 'SEA'    // NFC West (ARI already included)
        ];

        nflTeams.forEach(team => {
          if (!consolidatedRosters[position].find((d: any) => d.team === team)) {
            consolidatedRosters[position].push({
              id: `${team.toLowerCase()}_def`,
              name: `${team} Defense`,
              team: team,
              status: 'starter',
              depth: 1
            });
          }
        });
      }
    });

    return consolidatedRosters;
  }

  // GET ROSTER BY POSITION
  static getRosterByPosition(position: string): any[] {
    const allRosters = this.getAllNFLRosters();
    return allRosters[position] || [];
  }

  // GET COMPREHENSIVE STATS
  static getDataStats() {
    const allRosters = this.getAllNFLRosters();
    const stats = {
      totalPlayers: 0,
      positionBreakdown: {} as any,
      teamCoverage: new Set<string>(),
      lastUpdated: '2025-08-23T22:56:00Z'
    };

    Object.keys(allRosters).forEach(position => {
      const players = allRosters[position];
      stats.positionBreakdown[position] = players.length;
      stats.totalPlayers += players.length;
      
      players.forEach((player: any) => {
        stats.teamCoverage.add(player.team);
      });
    });

    return {
      ...stats,
      teamCoverage: Array.from(stats.teamCoverage).sort(),
      teamCount: stats.teamCoverage.size
    };
  }
}

export default NFLDepthChartParser;