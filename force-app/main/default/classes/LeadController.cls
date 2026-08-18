public with sharing class LeadController {
    
    @AuraEnabled
    public static List<Lead> getLeadRecordImperatively() {
        // Retrieve all Lead records with Name, Company, and Status fields
        // sorted alphabetically by Name for consistent display
        return [
            SELECT Name, Company, Status 
            FROM Lead 
            ORDER BY Name
        ];
    }

}