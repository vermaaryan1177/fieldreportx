// Lightweight module-level store for passing ephemeral state between screens.

import { Report, SectionStatus, Template } from "@/lib/types";

export interface ReportSetup {
    title: string;
    description: string;
    inspectorName: string;
    date: string;
    gpsEnabled: boolean;
}

let _selectedReport: Report | null = null;
let _comparisonReports: [Report, Report] | null = null;
let _selectedTemplateId: string | null = null;
let _selectedUserTemplate: Template | null = null;
let _reportSetup: ReportSetup | null = null;
let _fieldValues: Record<string, Record<string, string | boolean | number>> = {};
let _sectionStatuses: Record<string, SectionStatus> = {};

export const store = {
    get selectedReport() {
        return _selectedReport;
    },
    setSelectedReport(report: Report | null) {
        _selectedReport = report;
    },

    get comparisonReports() {
        return _comparisonReports;
    },
    setComparisonReports(pair: [Report, Report] | null) {
        _comparisonReports = pair;
    },

    get selectedTemplateId() {
        return _selectedTemplateId;
    },
    setSelectedTemplate(id: string | null) {
        _selectedTemplateId = id;
    },

    get selectedUserTemplate() {
        return _selectedUserTemplate;
    },
    setSelectedUserTemplate(template: Template | null) {
        _selectedUserTemplate = template;
    },

    get reportSetup() {
        return _reportSetup;
    },
    setReportSetup(setup: ReportSetup) {
        _reportSetup = setup;
    },

    getFieldValues(sectionId: string): Record<string, string | boolean | number> {
        return _fieldValues[sectionId] ?? {};
    },
    setFieldValues(sectionId: string, values: Record<string, string | boolean | number>) {
        _fieldValues[sectionId] = values;
    },

    getSectionStatus(sectionId: string): SectionStatus {
        return _sectionStatuses[sectionId] ?? "notstarted";
    },
    setSectionStatus(sectionId: string, status: SectionStatus) {
        _sectionStatuses[sectionId] = status;
    },

    clearReport() {
        _selectedTemplateId = null;
        _selectedUserTemplate = null;
        _reportSetup = null;
        _fieldValues = {};
        _sectionStatuses = {};
    },
};
