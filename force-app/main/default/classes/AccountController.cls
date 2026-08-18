public with sharing class AccountController {

    @AuraEnabled(cacheable=false)
    public static List<Account> getAccounts() {
        // Retrieve all accounts with key fields and sort alphabetically by name
        return [
            SELECT 
                Id, 
                Name, 
                Industry, 
                Phone, 
                Website 
            FROM Account 
            ORDER BY Name
        ]; 
    }
}