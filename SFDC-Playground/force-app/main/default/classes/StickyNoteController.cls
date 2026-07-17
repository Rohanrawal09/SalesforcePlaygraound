/**
 * @description Controller class for managing Sticky_Note__c records via Lightning Web Components (LWC) or Aura.
 * Enforces sharing rules to ensure users only see and modify notes they have access to.
 */
public with sharing class StickyNoteController {

    /**
     * @description Retrieves all active (non-archived) sticky notes.
     * Cached for optimal performance in Lightning components. Notes are sorted 
     * with pinned notes at the top, followed by the most recently modified.
     * 
     * @return List<Sticky_Note__c> A list of active sticky note records.
     * @throws AuraHandledException If the SOQL query fails.
     */
    @AuraEnabled(cacheable=true)
    public static List<Sticky_Note__c> getNotes() {
        try {
            // Query all unarchived notes and order them by pinned status, then by last modified
            return [
                SELECT Id,
                       Name,
                       Title__c,
                       Description__c,
                       Color__c,
                       Priority__c,
                       Category__c,
                       IsPinned__c,
                       Archived__c,
                       Reminder_Date__c,
                       CreatedDate,
                       LastModifiedDate
                FROM Sticky_Note__c
                WHERE Archived__c = false
                ORDER BY IsPinned__c DESC,
                         LastModifiedDate DESC
            ];
        } catch (Exception e) {
            // Wrap system exceptions in AuraHandledException so LWC can read the error message
            throw new AuraHandledException('Error retrieving notes: ' + e.getMessage());
        }
    }

    /**
     * @description Creates a new sticky note in the database.
     * 
     * @param note The Sticky_Note__c record to be inserted.
     * @return Sticky_Note__c The newly inserted sticky note record, complete with its new Salesforce Id.
     * @throws AuraHandledException If the note is null, missing a title, or fails DML insertion.
     */
    @AuraEnabled
    public static Sticky_Note__c createNote(Sticky_Note__c note) {
        try {
            // Input validation: Ensure the payload exists
            if (note == null) {
                throw new AuraHandledException('Note cannot be null.');
            }

            // Input validation: Ensure the required Title field is populated
            if (String.isBlank(note.Title__c)) {
                throw new AuraHandledException('Title is required.');
            }

            // Perform the DML operation to save the record
            insert note;

            return note;

        } catch (Exception e) {
            throw new AuraHandledException('Unable to create note: ' + e.getMessage());
        }
    }

    /**
     * @description Updates an existing sticky note. It queries the current state of the note first 
     * to ensure we are only updating specific fields and not overwriting unmapped data.
     * 
     * @param updatedNote The Sticky_Note__c record containing the new values and the record Id.
     * @return Sticky_Note__c The updated sticky note record.
     * @throws AuraHandledException If the note/Id is missing or if the DML update fails.
     */
    @AuraEnabled
    public static Sticky_Note__c updateNote(Sticky_Note__c updatedNote) {
        try {
            // Input validation: Ensure we have a valid object and Id to update
            if (updatedNote == null || updatedNote.Id == null) {
                throw new AuraHandledException('Invalid note.');
            }

            // Query the existing record from the database to securely update fields
            Sticky_Note__c note = [
                SELECT Id,
                       Title__c,
                       Description__c,
                       Color__c,
                       Priority__c,
                       Category__c,
                       IsPinned__c,
                       Archived__c,
                       Reminder_Date__c
                FROM Sticky_Note__c
                WHERE Id = :updatedNote.Id
                LIMIT 1
            ];

            // Map the new values from the client to the queried record
            note.Title__c = updatedNote.Title__c;
            note.Description__c = updatedNote.Description__c;
            note.Color__c = updatedNote.Color__c;
            note.Priority__c = updatedNote.Priority__c;
            note.Category__c = updatedNote.Category__c;
            note.IsPinned__c = updatedNote.IsPinned__c;
            note.Archived__c = updatedNote.Archived__c;
            note.Reminder_Date__c = updatedNote.Reminder_Date__c;

            // Perform the DML operation to commit changes
            update note;

            return note;

        } catch (Exception e) {
            throw new AuraHandledException('Unable to update note: ' + e.getMessage());
        }
    }

    /**
     * @description Deletes a specific sticky note from the database.
     * 
     * @param noteId The Salesforce Id of the Sticky_Note__c record to delete.
     * @throws AuraHandledException If the Id is null or the DML delete operation fails.
     */
    @AuraEnabled
    public static void deleteNote(Id noteId) {
        try {
            // Input validation: Ensure an Id was provided
            if (noteId == null) {
                throw new AuraHandledException('Note Id is required.');
            }

            // Query for the record and delete it in a single statement
            delete [
                SELECT Id
                FROM Sticky_Note__c
                WHERE Id = :noteId
                LIMIT 1
            ];

        } catch (Exception e) {
            throw new AuraHandledException('Unable to delete note: ' + e.getMessage());
        }
    }

    /**
     * @description Searches for active sticky notes whose titles match the provided search string.
     * Cached for real-time search filtering in the UI.
     * 
     * @param searchKey The string to search for within the note titles.
     * @return List<Sticky_Note__c> A list of sticky notes matching the search criteria.
     * @throws AuraHandledException If the search query fails.
     */
    @AuraEnabled(cacheable=true)
    public static List<Sticky_Note__c> searchNotes(String searchKey) {
        try {
            // Format the search string with wildcard characters for a partial match (LIKE operator)
            String keyword = '%' + searchKey + '%';

            // Query active notes matching the keyword, ordered by most recently modified
            return [
                SELECT Id,
                       Name,
                       Title__c,
                       Description__c,
                       Color__c,
                       Priority__c,
                       Category__c,
                       IsPinned__c,
                       Archived__c,
                       Reminder_Date__c
                FROM Sticky_Note__c
                WHERE Archived__c = false
                AND Title__c LIKE :keyword
                ORDER BY LastModifiedDate DESC
            ];

        } catch (Exception e) {
            throw new AuraHandledException('Search failed: ' + e.getMessage());
        }
    }
}