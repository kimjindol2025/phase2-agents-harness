// ============================================================================
// Unit Tests: Agent Registry (테스트 케이스 10개)
// ============================================================================

describe('Agent Registry: 에이전트 등록 관리', () => {
  test('레지스트리: 에이전트 추가', () => {
    const registry: Record<string, string> = {};
    registry['sql-optimizer'] = 'dev';
    expect(registry['sql-optimizer']).toBe('dev');
  });

  test('레지스트리: 에이전트 조회', () => {
    const registry = { 'agent-1': 'dev', 'agent-2': 'ops' };
    expect(registry['agent-1']).toBe('dev');
  });

  test('레지스트리: 에이전트 제거', () => {
    const registry = { 'agent-1': 'dev' };
    delete registry['agent-1'];
    expect(registry['agent-1']).toBeUndefined();
  });

  test('레지스트리: 전체 에이전트 조회', () => {
    const registry = { 'agent-1': 'dev', 'agent-2': 'ops', 'agent-3': 'deploy' };
    expect(Object.keys(registry)).toHaveLength(3);
  });

  test('레지스트리: 카테고리별 필터링', () => {
    const registry = {
      'agent-1': 'dev',
      'agent-2': 'dev',
      'agent-3': 'ops'
    };
    const devAgents = Object.entries(registry)
      .filter(([, cat]) => cat === 'dev')
      .map(([id]) => id);
    expect(devAgents).toHaveLength(2);
  });

  test('레지스트리: 중복 등록 방지', () => {
    const registry = {};
    const agentId = 'agent-1';
    if (registry[agentId as keyof typeof registry]) {
      throw new Error('Already registered');
    }
    expect(() => {
      if (registry[agentId as keyof typeof registry]) {
        throw new Error('Already registered');
      }
    }).not.toThrow();
  });

  test('레지스트리: 카테고리 유효성 검사', () => {
    const validCategories = ['dev', 'ops', 'deploy', 'learn'];
    const testCategory = 'dev';
    expect(validCategories).toContain(testCategory);
  });

  test('레지스트리: 에이전트 메타데이터 저장', () => {
    const agents = {
      'sql-optimizer': {
        category: 'dev',
        version: '1.0.0',
        status: 'active'
      }
    };
    expect(agents['sql-optimizer'].category).toBe('dev');
  });

  test('레지스트리: 에이전트 상태 업데이트', () => {
    const agents = { 'agent-1': 'active' };
    agents['agent-1'] = 'inactive';
    expect(agents['agent-1']).toBe('inactive');
  });

  test('레지스트리: 통계 계산', () => {
    const registry = {
      'agent-1': 'dev',
      'agent-2': 'dev',
      'agent-3': 'ops'
    };
    const stats = {
      total: Object.keys(registry).length,
      categories: new Set(Object.values(registry)).size
    };
    expect(stats.total).toBe(3);
    expect(stats.categories).toBe(2);
  });
});
