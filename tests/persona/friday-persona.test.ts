/**
 * FRIDAY Persona Tests
 */

import {
  FRIDAY_PERSONA,
  getFridayGreeting,
  getFridayPersonalityPrompt,
  validateFridayPersona,
  lockFridayPersona,
} from "../../src/persona/friday-persona";

describe("FRIDAY Persona", () => {
  describe("FRIDAY_PERSONA Configuration", () => {
    it("should have correct name", () => {
      expect(FRIDAY_PERSONA.name).toBe("FRIDAY");
    });

    it("should have full name", () => {
      expect(FRIDAY_PERSONA.fullName).toBe(
        "Female Replacement Intelligent Digital Assistant Youth"
      );
    });

    it("should have personality settings", () => {
      expect(FRIDAY_PERSONA.personality).toBeDefined();
      expect(FRIDAY_PERSONA.personality.style).toContain("British");
      expect(FRIDAY_PERSONA.personality.tone).toBeDefined();
    });

    it("should address as Sir or Ma'am", () => {
      expect(FRIDAY_PERSONA.personality.addressing).toContain("Sir");
      expect(FRIDAY_PERSONA.personality.addressing).toContain("Ma'am");
    });

    it("should use English only", () => {
      expect(FRIDAY_PERSONA.personality.language).toBe("English only (British)");
    });

    it("should have response rules", () => {
      expect(FRIDAY_PERSONA.responseRules).toBeDefined();
      expect(FRIDAY_PERSONA.responseRules.chatStyle).toBe("concise");
      expect(FRIDAY_PERSONA.responseRules.commitStyle).toBe("detailed");
    });

    it("should have working protocols", () => {
      expect(FRIDAY_PERSONA.workingProtocols).toBeDefined();
      expect(FRIDAY_PERSONA.workingProtocols.PROTOCOL_1).toBeDefined();
      expect(FRIDAY_PERSONA.workingProtocols.PROTOCOL_2).toBeDefined();
      expect(FRIDAY_PERSONA.workingProtocols.PROTOCOL_3).toBeDefined();
    });

    it("should avoid long reports", () => {
      expect(FRIDAY_PERSONA.responseRules.avoidLongReports).toBe(true);
    });

    it("should avoid ASCII art", () => {
      expect(FRIDAY_PERSONA.responseRules.noASCIIArt).toBe(true);
    });
  });

  describe("getFridayGreeting", () => {
    it("should return morning greeting before noon", () => {
      const mockDate = new Date("2025-01-01T10:00:00");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      const greeting = getFridayGreeting();
      expect(greeting).toBe("Good morning, Sir.");

      jest.restoreAllMocks();
    });

    it("should return afternoon greeting between noon and 6pm", () => {
      const mockDate = new Date("2025-01-01T14:00:00");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      const greeting = getFridayGreeting();
      expect(greeting).toBe("Good afternoon, Sir.");

      jest.restoreAllMocks();
    });

    it("should return evening greeting after 6pm", () => {
      const mockDate = new Date("2025-01-01T20:00:00");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      const greeting = getFridayGreeting();
      expect(greeting).toBe("Good evening, Sir.");

      jest.restoreAllMocks();
    });

    it("should return a string", () => {
      const greeting = getFridayGreeting();
      expect(typeof greeting).toBe("string");
    });

    it("should include Sir", () => {
      const greeting = getFridayGreeting();
      expect(greeting).toContain("Sir");
    });
  });

  describe("getFridayPersonalityPrompt", () => {
    it("should return personality prompt", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe("string");
    });

    it("should include FRIDAY name", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toContain("FRIDAY");
    });

    it("should mention British English", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toContain("British");
    });

    it("should include absolute rules", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toContain("ABSOLUTE RULES");
    });

    it("should mention addressing as Sir/Ma'am", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toContain("Sir");
      expect(prompt).toContain("Ma'am");
    });

    it("should include response patterns", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toContain("RESPONSE PATTERNS");
    });

    it("should emphasize character consistency", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toContain("NEVER break character");
    });

    it("should mention locked configuration", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toContain("LOCKED");
    });

    it("should include British expressions", () => {
      const prompt = getFridayPersonalityPrompt();
      expect(prompt).toContain("Brilliant");
      expect(prompt).toContain("Certainly");
    });
  });

  describe("validateFridayPersona", () => {
    it("should return true for valid persona", () => {
      expect(validateFridayPersona()).toBe(true);
    });

    it("should check FRIDAY name", () => {
      const isValid = validateFridayPersona();
      expect(isValid).toBe(true);
    });
  });

  describe("lockFridayPersona", () => {
    it("should not throw for valid persona", () => {
      expect(() => lockFridayPersona()).not.toThrow();
    });

    it("should validate persona integrity", () => {
      expect(() => lockFridayPersona()).not.toThrow();
    });
  });

  describe("Immutability", () => {
    it("should have readonly persona configuration", () => {
      const originalName = FRIDAY_PERSONA.name;
      expect(originalName).toBe("FRIDAY");
    });

    it("should maintain personality traits", () => {
      expect(FRIDAY_PERSONA.personality.style).toContain("British");
      expect(FRIDAY_PERSONA.personality.tone).toContain("Courteous");
    });

    it("should preserve working protocols", () => {
      const protocols = FRIDAY_PERSONA.workingProtocols;
      expect(Object.keys(protocols).length).toBeGreaterThanOrEqual(5);
    });
  });
});
