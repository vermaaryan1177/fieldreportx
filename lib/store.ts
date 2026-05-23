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
let _currentOrgId: string | null = null;
let _selectedTemplateId: string | null = null;
let _selectedUserTemplate: Template | null = null;
let _reportSetup: ReportSetup | null = null;
let _fieldValues: Record<string, Record<string, string | boolean | number>> = {};
let _sectionStatuses: Record<string, SectionStatus> = {};
let _orgReportMode: boolean = false;
let _orgTemplateMode: boolean = false;
// ID of the Firestore doc for a report currently being drafted or edited
let _draftReportId: string | null = null;
// Pre-fill data for resuming a draft on the setup screen
let _resumeSetup: (ReportSetup & { templateId: string; description: string }) | null = null;
// Screen the editor's back button should return to
let _editorBackScreen: string = "reportSetup";

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

    get currentOrgId() {
        return _currentOrgId;
    },
    setCurrentOrgId(id: string | null) {
        _currentOrgId = id;
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

    get orgReportMode() {
        return _orgReportMode;
    },
    setOrgReportMode(v: boolean) {
        _orgReportMode = v;
    },

    get orgTemplateMode() {
        return _orgTemplateMode;
    },
    setOrgTemplateMode(v: boolean) {
        _orgTemplateMode = v;
    },

    get draftReportId() {
        return _draftReportId;
    },
    setDraftReportId(id: string | null) {
        _draftReportId = id;
    },

    get resumeSetup() {
        return _resumeSetup;
    },
    setResumeSetup(data: (ReportSetup & { templateId: string; description: string }) | null) {
        _resumeSetup = data;
    },

    get editorBackScreen() {
        return _editorBackScreen;
    },
    setEditorBackScreen(screen: string) {
        _editorBackScreen = screen;
    },

    clearReport() {
        _selectedTemplateId = null;
        _selectedUserTemplate = null;
        _reportSetup = null;
        _fieldValues = {};
        _sectionStatuses = {};
        _orgReportMode = false;
        _draftReportId = null;
        _resumeSetup = null;
        _editorBackScreen = "reportSetup";
    },
};
