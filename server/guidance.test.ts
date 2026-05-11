import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GuidanceEngine, type GuidanceContext, type NextAction } from './services/guidanceEngine';

describe('GuidanceEngine', () => {
  let engine: GuidanceEngine;
  let mockContext: GuidanceContext;

  beforeEach(() => {
    engine = new GuidanceEngine();
    mockContext = {
      workspaceId: 1,
      userId: 1,
    };
  });

  describe('analyzeWorkspace', () => {
    it('should return an array of NextAction objects', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      expect(Array.isArray(actions)).toBe(true);
    });

    it('should return actions with required fields', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      
      if (actions.length > 0) {
        const action = actions[0];
        expect(action).toHaveProperty('category');
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('description');
        expect(action).toHaveProperty('actionType');
        expect(action).toHaveProperty('priority');
        expect(action).toHaveProperty('reason');
        expect(action).toHaveProperty('estimatedMinutes');
      }
    });

    it('should return actions with valid priority levels', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      
      actions.forEach(action => {
        expect(validPriorities).toContain(action.priority);
      });
    });

    it('should suggest creating first opportunity when workspace is empty', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      const hasOpportunityAction = actions.some(
        a => a.actionType === 'create_first_opportunity' || a.category === 'opportunity'
      );
      expect(hasOpportunityAction).toBe(true);
    });
  });

  describe('getNextBestAction', () => {
    it('should return a single NextAction or null', async () => {
      const action = await engine.getNextBestAction(mockContext);
      expect(action === null || typeof action === 'object').toBe(true);
      
      if (action) {
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('description');
      }
    });

    it('should return the highest priority action when multiple exist', async () => {
      const action = await engine.getNextBestAction(mockContext);
      
      if (action) {
        const allActions = await engine.analyzeWorkspace(mockContext);
        const highestPriorityAction = allActions.reduce((prev, current) => {
          const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityMap[current.priority] > priorityMap[prev.priority] ? current : prev;
        });
        
        expect(action.priority).toBe(highestPriorityAction.priority);
      }
    });
  });

  describe('Action Categories', () => {
    it('should include opportunity category actions', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      const hasOpportunityCategory = actions.some(a => a.category === 'opportunity');
      expect(hasOpportunityCategory).toBe(true);
    });

    it('should include compliance category actions', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      const hasComplianceCategory = actions.some(a => a.category === 'compliance');
      expect(hasComplianceCategory).toBe(true);
    });

    it('should include team category actions', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      const hasTeamCategory = actions.some(a => a.category === 'team');
      expect(hasTeamCategory).toBe(true);
    });
  });

  describe('Action Types', () => {
    it('should return actions with valid action types', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      const validActionTypes = [
        'create_first_opportunity',
        'add_contacts',
        'upload_documents',
        'invite_team',
        'create_proposal',
        'review_compliance',
        'track_contract',
      ];

      actions.forEach(action => {
        expect(validActionTypes).toContain(action.actionType);
      });
    });
  });

  describe('Estimated Minutes', () => {
    it('should have reasonable estimated minutes for each action', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      
      actions.forEach(action => {
        expect(typeof action.estimatedMinutes).toBe('number');
        expect(action.estimatedMinutes).toBeGreaterThan(0);
        expect(action.estimatedMinutes).toBeLessThan(480); // Less than 8 hours
      });
    });
  });

  describe('Rationale Field', () => {
    it('should optionally include rationale for actions', async () => {
      const actions = await engine.analyzeWorkspace(mockContext);
      
      actions.forEach(action => {
        if (action.rationale) {
          expect(typeof action.rationale).toBe('string');
          expect(action.rationale.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
