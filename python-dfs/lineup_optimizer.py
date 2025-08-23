#!/usr/bin/env python3
"""
Professional DFS Lineup Optimizer
Powered by pydfs-lineup-optimizer + R Analytics projections
Champions for Change Tournament Platform
"""

import json
import sys
from pydfs_lineup_optimizer import get_optimizer, Site, Sport, Player
from typing import List, Dict, Any

def create_lineup_optimizer(site: str, sport: str):
    """Create optimizer for specific site and sport"""
    
    # Map site strings to pydfs Site enums
    site_mapping = {
        'draftkings': Site.DRAFTKINGS,
        'fanduel': Site.FANDUEL,
        'yahoo': Site.YAHOO,
        'fantasydraft': Site.FANTASY_DRAFT
    }
    
    # Map sport strings to pydfs Sport enums  
    sport_mapping = {
        'nfl': Sport.FOOTBALL,
        'nba': Sport.BASKETBALL,
        'mlb': Sport.BASEBALL,
        'nhl': Sport.HOCKEY
    }
    
    if site not in site_mapping:
        raise ValueError(f"Unsupported site: {site}")
    if sport not in sport_mapping:
        raise ValueError(f"Unsupported sport: {sport}")
    
    return get_optimizer(site_mapping[site], sport_mapping[sport])

def optimize_lineups(site: str, sport: str, players_data: List[Dict], num_lineups: int = 5):
    """Generate optimal lineups using pydfs-lineup-optimizer"""
    
    try:
        # Create optimizer
        optimizer = create_lineup_optimizer(site, sport)
        
        # Add players to optimizer
        players = []
        for player_data in players_data:
            player = Player(
                player_data['id'],
                player_data['name'],
                player_data['position'],
                player_data['team'],
                player_data['salary'],
                player_data['projected_points'],
                fppg=player_data['projected_points']  # Add required fppg parameter
            )
            players.append(player)
            
        optimizer.player_pool.load_players(players)
        
        # Generate optimized lineups
        lineups = []
        for i, lineup in enumerate(optimizer.optimize(num_lineups)):
            lineup_data = {
                'lineup_number': i + 1,
                'total_salary': lineup.salary,
                'total_points': round(lineup.projected, 2),
                'players': []
            }
            
            for player in lineup.players:
                lineup_data['players'].append({
                    'id': player.id,
                    'name': player.full_name,
                    'position': player.position,
                    'team': player.team,
                    'salary': player.salary,
                    'projected_points': player.projected,
                    'value': round(player.projected / (player.salary / 1000), 2) if player.salary > 0 else 0
                })
            
            lineups.append(lineup_data)
        
        return {
            'success': True,
            'site': site,
            'sport': sport,
            'lineups': lineups,
            'optimizer_info': {
                'salary_cap': optimizer.settings.salary_cap,
                'total_players': optimizer.settings.total_players,
                'positions': [str(pos) for pos in optimizer.settings.positions]
            },
            'source': 'pydfs-lineup-optimizer',
            'num_generated': len(lineups)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'site': site,
            'sport': sport
        }

def get_sample_projections(sport: str, position: str):
    """Get sample player projections for testing"""
    
    if sport == 'nfl':
        if position == 'QB':
            return [
                {'id': 'allen', 'name': 'Josh Allen', 'position': 'QB', 'team': 'BUF', 'salary': 8000, 'projected_points': 24.8},
                {'id': 'jackson', 'name': 'Lamar Jackson', 'position': 'QB', 'team': 'BAL', 'salary': 7800, 'projected_points': 24.2},
                {'id': 'hurts', 'name': 'Jalen Hurts', 'position': 'QB', 'team': 'PHI', 'salary': 7600, 'projected_points': 23.6},
                {'id': 'prescott', 'name': 'Dak Prescott', 'position': 'QB', 'team': 'DAL', 'salary': 7400, 'projected_points': 22.8}
            ]
        elif position == 'RB':
            return [
                {'id': 'mccaffrey', 'name': 'Christian McCaffrey', 'position': 'RB', 'team': 'SF', 'salary': 9000, 'projected_points': 19.8},
                {'id': 'ekeler', 'name': 'Austin Ekeler', 'position': 'RB', 'team': 'WAS', 'salary': 7200, 'projected_points': 17.2},
                {'id': 'robinson', 'name': 'Bijan Robinson', 'position': 'RB', 'team': 'ATL', 'salary': 7000, 'projected_points': 16.8},
                {'id': 'henry', 'name': 'Derrick Henry', 'position': 'RB', 'team': 'BAL', 'salary': 6800, 'projected_points': 16.2}
            ]
        elif position == 'WR':
            return [
                {'id': 'hill', 'name': 'Tyreek Hill', 'position': 'WR', 'team': 'MIA', 'salary': 8200, 'projected_points': 16.8},
                {'id': 'lamb', 'name': 'CeeDee Lamb', 'position': 'WR', 'team': 'DAL', 'salary': 8000, 'projected_points': 16.2},
                {'id': 'diggs', 'name': 'Stefon Diggs', 'position': 'WR', 'team': 'HOU', 'salary': 7800, 'projected_points': 15.9},
                {'id': 'stbrown', 'name': 'Amon-Ra St. Brown', 'position': 'WR', 'team': 'DET', 'salary': 7600, 'projected_points': 15.4}
            ]
        elif position == 'TE':
            return [
                {'id': 'kelce', 'name': 'Travis Kelce', 'position': 'TE', 'team': 'KC', 'salary': 6400, 'projected_points': 14.2},
                {'id': 'andrews', 'name': 'Mark Andrews', 'position': 'TE', 'team': 'BAL', 'salary': 5800, 'projected_points': 12.8},
                {'id': 'laporta', 'name': 'Sam LaPorta', 'position': 'TE', 'team': 'DET', 'salary': 5600, 'projected_points': 12.1}
            ]
    
    return []

def generate_sample_lineup(site: str = 'draftkings', sport: str = 'nfl'):
    """Generate a sample optimized lineup for demonstration"""
    
    # Create mock optimal lineups without using the complex optimizer for demo
    lineups = [
        {
            'lineup_number': 1,
            'total_salary': 49800,
            'total_points': 124.8,
            'players': [
                {'id': 'allen', 'name': 'Josh Allen', 'position': 'QB', 'team': 'BUF', 'salary': 8000, 'projected_points': 24.8, 'value': 3.1},
                {'id': 'mccaffrey', 'name': 'Christian McCaffrey', 'position': 'RB', 'team': 'SF', 'salary': 9000, 'projected_points': 19.8, 'value': 2.2},
                {'id': 'ekeler', 'name': 'Austin Ekeler', 'position': 'RB', 'team': 'WAS', 'salary': 7200, 'projected_points': 17.2, 'value': 2.4},
                {'id': 'hill', 'name': 'Tyreek Hill', 'position': 'WR', 'team': 'MIA', 'salary': 8200, 'projected_points': 16.8, 'value': 2.0},
                {'id': 'lamb', 'name': 'CeeDee Lamb', 'position': 'WR', 'team': 'DAL', 'salary': 8000, 'projected_points': 16.2, 'value': 2.0},
                {'id': 'diggs', 'name': 'Stefon Diggs', 'position': 'WR', 'team': 'HOU', 'salary': 7800, 'projected_points': 15.9, 'value': 2.0},
                {'id': 'kelce', 'name': 'Travis Kelce', 'position': 'TE', 'team': 'KC', 'salary': 6400, 'projected_points': 14.2, 'value': 2.2},
                {'id': 'sf_def', 'name': 'San Francisco 49ers', 'position': 'DST', 'team': 'SF', 'salary': 3200, 'projected_points': 8.5, 'value': 2.7},
                {'id': 'tucker', 'name': 'Justin Tucker', 'position': 'K', 'team': 'BAL', 'salary': 5200, 'projected_points': 7.8, 'value': 1.5}
            ]
        },
        {
            'lineup_number': 2,
            'total_salary': 49600,
            'total_points': 122.4,
            'players': [
                {'id': 'jackson', 'name': 'Lamar Jackson', 'position': 'QB', 'team': 'BAL', 'salary': 7800, 'projected_points': 24.2, 'value': 3.1},
                {'id': 'robinson', 'name': 'Bijan Robinson', 'position': 'RB', 'team': 'ATL', 'salary': 7000, 'projected_points': 16.8, 'value': 2.4},
                {'id': 'henry', 'name': 'Derrick Henry', 'position': 'RB', 'team': 'BAL', 'salary': 6800, 'projected_points': 16.2, 'value': 2.4},
                {'id': 'stbrown', 'name': 'Amon-Ra St. Brown', 'position': 'WR', 'team': 'DET', 'salary': 7600, 'projected_points': 15.4, 'value': 2.0},
                {'id': 'brown_aj', 'name': 'A.J. Brown', 'position': 'WR', 'team': 'PHI', 'salary': 7400, 'projected_points': 15.1, 'value': 2.0},
                {'id': 'jefferson', 'name': 'Justin Jefferson', 'position': 'WR', 'team': 'MIN', 'salary': 8400, 'projected_points': 16.5, 'value': 2.0},
                {'id': 'andrews', 'name': 'Mark Andrews', 'position': 'TE', 'team': 'BAL', 'salary': 5800, 'projected_points': 12.8, 'value': 2.2},
                {'id': 'buf_def', 'name': 'Buffalo Bills', 'position': 'DST', 'team': 'BUF', 'salary': 3000, 'projected_points': 8.2, 'value': 2.7},
                {'id': 'mcpherson', 'name': 'Evan McPherson', 'position': 'K', 'team': 'CIN', 'salary': 5000, 'projected_points': 7.5, 'value': 1.5}
            ]
        }
    ]
    
    return {
        'success': True,
        'site': site,
        'sport': sport,
        'lineups': lineups,
        'optimizer_info': {
            'salary_cap': 50000,
            'total_players': 9,
            'positions': ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'DST', 'K']
        },
        'source': 'pydfs-lineup-optimizer-demo',
        'num_generated': len(lineups)
    }

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 3:
        # Default demo
        result = generate_sample_lineup()
        print(json.dumps(result, indent=2))
        return
    
    command = sys.argv[1]
    
    if command == 'demo':
        site = sys.argv[2] if len(sys.argv) > 2 else 'draftkings'
        sport = sys.argv[3] if len(sys.argv) > 3 else 'nfl'
        result = generate_sample_lineup(site, sport)
        print(json.dumps(result, indent=2))
    
    elif command == 'optimize':
        if len(sys.argv) < 5:
            print(json.dumps({'success': False, 'error': 'Missing parameters for optimize command'}))
            return
        
        site = sys.argv[2]
        sport = sys.argv[3]
        players_json = sys.argv[4]
        num_lineups = int(sys.argv[5]) if len(sys.argv) > 5 else 5
        
        try:
            players_data = json.loads(players_json)
            result = optimize_lineups(site, sport, players_data, num_lineups)
            print(json.dumps(result, indent=2))
        except json.JSONDecodeError:
            print(json.dumps({'success': False, 'error': 'Invalid JSON for players data'}))
    
    else:
        print(json.dumps({'success': False, 'error': f'Unknown command: {command}'}))

if __name__ == "__main__":
    main()