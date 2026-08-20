/**
 * @description Controller responsible for fetching queryable Salesforce objects 
 * and their accessible fields dynamically for the SOQL Builder tool.
 */
public with sharing class SoqlBuilderController {
    
    /**
     * @description Fetches all queryable and accessible objects in the Salesforce org.
     * @return List of maps containing the label and API name of each object.
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getQueryableObjects() {
        List<Map<String, String>> objectOptions = new List<Map<String, String>>();
        
        // Loop through all objects available in the Salesforce org
        for (Schema.SObjectType objType : Schema.getGlobalDescribe().values()) {
            Schema.DescribeSObjectResult describe = objType.getDescribe();
            
            // Only include objects the current user has permission to query and access
            if (describe.isQueryable() && describe.isAccessible()) {
                objectOptions.add(new Map<String, String>{
                    'label' => describe.getLabel() + ' (' + describe.getName() + ')',
                    'value' => describe.getName()
                });
            }
        }
        return objectOptions;
    }

    /**
     * @description Fetches all accessible fields for a specific Salesforce object.
     * @param objectName The API name of the selected object.
     * @return List of maps containing the label and API name of each field.
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getObjectFields(String objectName) {
        List<Map<String, String>> fieldOptions = new List<Map<String, String>>();
        
        // Return empty list if no object name was provided
        if (String.isBlank(objectName)) {
            return fieldOptions;
        }

        SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        if (objType == null) {
            return fieldOptions;
        }

        // Get all fields belonging to the specified object
        Map<String, Schema.SObjectField> fieldMap = objType.getDescribe().fields.getMap();
        
        for (Schema.SObjectField field : fieldMap.values()) {
            Schema.DescribeFieldResult describe = field.getDescribe();
            
            // Only include fields that are accessible to the user
            if (describe.isAccessible()) {
                fieldOptions.add(new Map<String, String>{
                    'label' => describe.getLabel() + ' (' + describe.getName() + ')',
                    'value' => describe.getName()
                });
            }
        }
        return fieldOptions;
    }
}