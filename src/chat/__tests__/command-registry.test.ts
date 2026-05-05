import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  COMMAND_ALIASES,
  INTERNAL_TO_EXPOSED,
  getExposedCommand,
  getInternalCommand,
  fuzzyMatchCommand,
} from '../command-registry';

describe('COMMAND_ALIASES', () => {
  it('should map all dev-* prefixed commands', () => {
    expect(COMMAND_ALIASES['dev-frontend']).toBe('frontend');
    expect(COMMAND_ALIASES['dev-backend']).toBe('backend');
    expect(COMMAND_ALIASES['dev-springboot']).toBe('springboot');
    expect(COMMAND_ALIASES['dev-python']).toBe('python');
    expect(COMMAND_ALIASES['dev-data']).toBe('data');
    expect(COMMAND_ALIASES['dev-sql']).toBe('sql');
    expect(COMMAND_ALIASES['dev-dbschema']).toBe('dbschema');
    expect(COMMAND_ALIASES['dev-pipeline']).toBe('pipeline');
    expect(COMMAND_ALIASES['dev-api']).toBe('api');
  });

  it('should map all test-* prefixed commands', () => {
    expect(COMMAND_ALIASES['test-plan']).toBe('test');
    expect(COMMAND_ALIASES['test-api-gen']).toBe('api-test-gen');
    expect(COMMAND_ALIASES['test-springboot-api']).toBe('springboot-api-tests');
    expect(COMMAND_ALIASES['test-python-api']).toBe('python-api-tests');
    expect(COMMAND_ALIASES['test-data']).toBe('data-test');
  });

  it('should map all debug-* prefixed commands', () => {
    expect(COMMAND_ALIASES['debug-review']).toBe('review');
    expect(COMMAND_ALIASES['debug-doc']).toBe('doc-review');
    expect(COMMAND_ALIASES['debug-sql']).toBe('sql-review');
    expect(COMMAND_ALIASES['debug-data']).toBe('data-review');
    expect(COMMAND_ALIASES['debug-impact']).toBe('impact-analysis');
  });
});

describe('INTERNAL_TO_EXPOSED (reverse mapping)', () => {
  it('should have the same number of entries as COMMAND_ALIASES', () => {
    expect(Object.keys(INTERNAL_TO_EXPOSED).length).toBe(Object.keys(COMMAND_ALIASES).length);
  });

  it('should correctly reverse every alias', () => {
    for (const [exposed, internal] of Object.entries(COMMAND_ALIASES)) {
      expect(INTERNAL_TO_EXPOSED[internal]).toBe(exposed);
    }
  });

  it('should not map commands without prefix aliases', () => {
    expect(INTERNAL_TO_EXPOSED['plan']).toBeUndefined();
    expect(INTERNAL_TO_EXPOSED['init']).toBeUndefined();
    expect(INTERNAL_TO_EXPOSED['help']).toBeUndefined();
  });
});

describe('getExposedCommand', () => {
  it('should return the exposed prefixed version for known internal commands', () => {
    expect(getExposedCommand('frontend')).toBe('dev-frontend');
    expect(getExposedCommand('api-test-gen')).toBe('test-api-gen');
    expect(getExposedCommand('review')).toBe('debug-review');
  });

  it('should return the same command if no alias exists', () => {
    expect(getExposedCommand('init')).toBe('init');
    expect(getExposedCommand('plan')).toBe('plan');
    expect(getExposedCommand('help')).toBe('help');
    expect(getExposedCommand('unknown-command')).toBe('unknown-command');
  });

  it('should handle empty string', () => {
    expect(getExposedCommand('')).toBe('');
  });
});

describe('getInternalCommand', () => {
  it('should return the internal name for known exposed commands', () => {
    expect(getInternalCommand('dev-frontend')).toBe('frontend');
    expect(getInternalCommand('test-api-gen')).toBe('api-test-gen');
    expect(getInternalCommand('debug-review')).toBe('review');
  });

  it('should return the same command if no alias exists', () => {
    expect(getInternalCommand('init')).toBe('init');
    expect(getInternalCommand('plan')).toBe('plan');
    expect(getInternalCommand('api-test-gen')).toBe('api-test-gen');
  });

  it('should handle empty string', () => {
    expect(getInternalCommand('')).toBe('');
  });
});

describe('fuzzyMatchCommand', () => {
  describe('Chinese intent matching', () => {
    it('should match 前端 to dev-frontend', () => {
      expect(fuzzyMatchCommand('帮我写一个前端页面')).toBe('dev-frontend');
      expect(fuzzyMatchCommand('前端开发')).toBe('dev-frontend');
    });

    it('should match 后端 to dev-backend', () => {
      expect(fuzzyMatchCommand('后端接口开发')).toBe('dev-backend');
    });

    it('should match 数据 to dev-data', () => {
      expect(fuzzyMatchCommand('数据处理管道')).toBe('dev-data');
    });

    it('should match 建表 to dev-dbschema', () => {
      expect(fuzzyMatchCommand('建表脚本')).toBe('dev-dbschema');
      expect(fuzzyMatchCommand('schema设计')).toBe('dev-dbschema');
    });

    it('should match 测试 to test-plan when no API context', () => {
      expect(fuzzyMatchCommand('帮我写测试')).toBe('test-plan');
    });

    it('should match 测试+接口 to test-api-gen', () => {
      expect(fuzzyMatchCommand('测试接口')).toBe('test-api-gen');
      expect(fuzzyMatchCommand('接口测试')).toBe('test-api-gen');
    });

    it('should match 测试+数据 to test-data', () => {
      expect(fuzzyMatchCommand('测试数据管道')).toBe('test-data');
    });
  });

  describe('English intent matching', () => {
    it('should match frontend keyword', () => {
      expect(fuzzyMatchCommand('frontend page design')).toBe('dev-frontend');
      expect(fuzzyMatchCommand('help with frontend')).toBe('dev-frontend');
    });

    it('should match backend keyword', () => {
      expect(fuzzyMatchCommand('backend API design')).toBe('dev-backend');
    });

    it('should match springboot keyword', () => {
      expect(fuzzyMatchCommand('springboot controller')).toBe('dev-springboot');
      expect(fuzzyMatchCommand('java service')).toBe('dev-springboot');
    });

    it('should match python keyword', () => {
      expect(fuzzyMatchCommand('python fastapi')).toBe('dev-python');
    });

    it('should match data keyword', () => {
      expect(fuzzyMatchCommand('data pipeline')).toBe('dev-data');
    });

    it('should match test+api to test-api-gen', () => {
      expect(fuzzyMatchCommand('test api endpoint')).toBe('test-api-gen');
      expect(fuzzyMatchCommand('api test generation')).toBe('test-api-gen');
    });

    it('should match review+code to debug-review', () => {
      expect(fuzzyMatchCommand('code review')).toBe('debug-review');
      expect(fuzzyMatchCommand('审查代码')).toBe('debug-review');
    });

    it('should match review+doc to debug-doc', () => {
      expect(fuzzyMatchCommand('document review')).toBe('debug-doc');
      expect(fuzzyMatchCommand('审查文档')).toBe('debug-doc');
    });

    it('should match sql review to debug-sql', () => {
      expect(fuzzyMatchCommand('sql review')).toBe('debug-sql');
    });

    it('should match summarize keyword', () => {
      expect(fuzzyMatchCommand('summarize this')).toBe('summarize');
      expect(fuzzyMatchCommand('总结一下')).toBe('summarize');
    });

    it('should match plan keyword', () => {
      expect(fuzzyMatchCommand('plan this work')).toBe('plan');
      expect(fuzzyMatchCommand('计划一下')).toBe('plan');
    });
  });

  describe('edge cases', () => {
    it('should return undefined for empty prompt', () => {
      expect(fuzzyMatchCommand('')).toBeUndefined();
    });

    it('should return undefined for prompt with no matching keywords', () => {
      expect(fuzzyMatchCommand('random gibberish xyz123')).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      expect(fuzzyMatchCommand('SPRINGBOOT')).toBe('dev-springboot');
      expect(fuzzyMatchCommand('Frontend')).toBe('dev-frontend');
      expect(fuzzyMatchCommand('SQL Review')).toBe('debug-sql');
    });

    it('should handle mixed Chinese and English', () => {
      expect(fuzzyMatchCommand('写一个SpringBoot的API')).toBe('dev-springboot');
      expect(fuzzyMatchCommand('Spring Boot')).toBe('dev-springboot');
      expect(fuzzyMatchCommand('Python的测试数据')).toBe('test-data');
    });
  });
});
