import { parseImportText } from "@/lib/importTemplate";

// ─── Valid inputs ─────────────────────────────────────────────────────────────

describe("parseImportText — valid inputs", () => {
    const minimalYaml = `
name: Site Inspection
sections:
  - name: General
    fields:
      - label: Notes
        type: text
`;

    it("parses a minimal YAML template", () => {
        const result = parseImportText(minimalYaml);
        expect(result.name).toBe("Site Inspection");
        expect(result.category).toBe("custom"); // default when omitted
        expect(result.gpsValidation).toBe(false); // default when omitted
        expect(result.sections).toHaveLength(1);
        expect(result.sections[0].name).toBe("General");
        expect(result.sections[0].fields).toHaveLength(1);
        expect(result.sections[0].fields[0].label).toBe("Notes");
        expect(result.sections[0].fields[0].type).toBe("text");
    });

    it("parses a JSON template", () => {
        const json = JSON.stringify({
            name: "Vehicle Check",
            category: "vehicle",
            gpsValidation: true,
            sections: [
                {
                    name: "Exterior",
                    fields: [{ label: "Body condition", type: "select", options: ["Good", "Fair", "Poor"] }],
                },
            ],
        });

        const result = parseImportText(json);
        expect(result.name).toBe("Vehicle Check");
        expect(result.category).toBe("vehicle");
        expect(result.gpsValidation).toBe(true);
        expect(result.sections[0].fields[0].options).toEqual(["Good", "Fair", "Poor"]);
    });

    it("assigns unique IDs to every section and field", () => {
        const result = parseImportText(minimalYaml);
        expect(typeof result.sections[0].id).toBe("string");
        expect(result.sections[0].id.length).toBeGreaterThan(0);
        expect(typeof result.sections[0].fields[0].id).toBe("string");
        expect(result.sections[0].fields[0].id.length).toBeGreaterThan(0);
    });

    it("defaults field type to 'text' when type is omitted", () => {
        const input = `
name: Quick Form
sections:
  - name: Details
    fields:
      - label: Description
`;
        const result = parseImportText(input);
        expect(result.sections[0].fields[0].type).toBe("text");
    });

    it("sets required to false by default", () => {
        const result = parseImportText(minimalYaml);
        expect(result.sections[0].fields[0].required).toBe(false);
    });

    it("respects required: true when set", () => {
        const input = `
name: Required Test
sections:
  - name: Info
    fields:
      - label: Site Name
        type: text
        required: true
`;
        const result = parseImportText(input);
        expect(result.sections[0].fields[0].required).toBe(true);
    });

    it("accepts all valid field types without throwing", () => {
        const validTypes = [
            "text", "number", "checkbox", "select", "photo",
            "signature", "route", "accelerometer", "timer", "stopwatch", "joint_angle",
        ];
        validTypes.forEach((type) => {
            const input = `
name: Type Test
sections:
  - name: Section
    fields:
      - label: Field
        type: ${type}
`;
            expect(() => parseImportText(input)).not.toThrow();
        });
    });

    it("parses multiple sections and fields", () => {
        const input = `
name: Multi Section
sections:
  - name: Part A
    fields:
      - label: Field 1
        type: text
      - label: Field 2
        type: number
  - name: Part B
    fields:
      - label: Photo
        type: photo
`;
        const result = parseImportText(input);
        expect(result.sections).toHaveLength(2);
        expect(result.sections[0].fields).toHaveLength(2);
        expect(result.sections[1].fields).toHaveLength(1);
    });
});

// ─── Invalid inputs ───────────────────────────────────────────────────────────

describe("parseImportText — invalid inputs", () => {
    it("throws on empty string", () => {
        expect(() => parseImportText("")).toThrow(
            "Nothing to import — paste your YAML or JSON above.",
        );
    });

    it("throws on whitespace-only input", () => {
        expect(() => parseImportText("   \n  ")).toThrow(
            "Nothing to import — paste your YAML or JSON above.",
        );
    });

    it("throws when name is missing", () => {
        const input = `
sections:
  - name: General
    fields:
      - label: Notes
        type: text
`;
        expect(() => parseImportText(input)).toThrow(/"name"/);
    });

    it("throws when sections is missing", () => {
        const input = `name: No Sections`;
        expect(() => parseImportText(input)).toThrow(/"sections"/);
    });

    it("throws when sections is an empty array", () => {
        const input = `
name: Empty
sections: []
`;
        expect(() => parseImportText(input)).toThrow(/"sections"/);
    });

    it("throws when a section has no fields", () => {
        const input = `
name: Bad Template
sections:
  - name: Empty Section
    fields: []
`;
        expect(() => parseImportText(input)).toThrow(/at least one field/);
    });

    it("throws when a field has an unknown type", () => {
        const input = `
name: Bad Type
sections:
  - name: Section
    fields:
      - label: Broken
        type: video
`;
        expect(() => parseImportText(input)).toThrow(/Unknown type "video"/);
    });

    it("throws when top level is an array instead of object", () => {
        const input = `- name: wrong`;
        expect(() => parseImportText(input)).toThrow(/Top level must be an object/);
    });
});
