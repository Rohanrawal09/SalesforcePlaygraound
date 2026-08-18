// Import standard LWC functionalities: LightningElement (base class), wire (for Apex calls), and track (for object reactivity)
import { LightningElement, wire, track } from 'lwc';

// Import the Apex method to fetch Accounts. Ensure you have an AccountController class with an @AuraEnabled(cacheable=true) getAccounts method.
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import getLeadRecordImperatively from '@salesforce/apex/LeadController.getLeadRecordImperatively';

export default class ParentComponent extends LightningElement {

    // ==================== DATA PROPERTIES ====================
    // Standard properties that trigger UI updates when reassigned.
    // These are primitive values that LWC automatically tracks.
    parentMessage = 'Following Message is from Parent to Child';
    parentUserName = 'Rohan Rawal';
    
    // ==================== TRACKED OBJECT PROPERTIES ====================
    // The @track decorator is required here because we are updating inner properties (this.parentAccountInfo.industry).
    // Without @track, LWC only watches for the entire object being reassigned, not nested property changes.
    // This ensures that modifications to the industry, employees, or other properties trigger UI re-renders.
    @track parentAccountInfo = {
        name: 'ABC Corporation',
        industry: 'Technology',
        employees: 500
    };

    // ==================== APEX DATA PROPERTIES ====================
    // Property to hold the data returned from the Apex SOQL query (declarative wire approach)
    parentQueryAccountDetails;

    // ==================== IMPERATIVE APEX DATA ====================
    // Property to hold lead data fetched using imperative method (manual call via async/await)
    parentImperativeLeadData;

    // ==================== CHILD TO PARENT COMMUNICATION ====================
    // Property to store the data received from child component via custom event
    messageFromChildToParent;

    // ==================== WIRE ADAPTER FOR ACCOUNTS ====================
    // The @wire decorator calls the Apex getAccounts method automatically when the component loads.
    // It provisions the results into the wiredParentQueryAccount function.
    // This approach is reactive and cacheable, improving performance.
    @wire(getAccounts)
    wiredParentQueryAccount({data, error}) {
        if (data) {
            // If the query succeeds, store the data in our property to pass to the child component
            this.parentQueryAccountDetails = data;
        } else if (error) {
            // Always good practice to handle potential errors from Apex calls
            console.error('Error fetching accounts:', error);
        }
    }

    // ==================== IMPERATIVE APEX METHODS ====================
    // Loads lead data imperatively instead of using @wire decorator.
    // This method is called explicitly from the parent component and provides more control over execution.
    // Uses async/await syntax for cleaner promise handling.
    async loadParentLeadData() {
        try {
            // Call Apex method imperatively and await the response
            this.parentImperativeLeadData = await getLeadRecordImperatively();   
        } catch (error) {
            // Handle any errors that occur during the Apex call
            console.error('Error loading accounts:', error);
        }
    }

    // ==================== PARENT TO CHILD COMMUNICATION ====================
    // This method is triggered when the user clicks the button in the parent component's HTML template.
    // It updates parent properties which are then passed to child components via property binding.
    sendParentDataToChild() {
        // Updating a primitive variable (parentMessage) automatically triggers a UI re-render
        this.parentMessage = 'Message updated by Parent to Child';
        
        // Updating an object's inner property (parentAccountInfo.industry) triggers a re-render 
        // because we used @track decorator on the parentAccountInfo object
        this.parentAccountInfo.industry = 'Technology / Finance';
    }
    
    // ==================== CHILD TO PARENT COMMUNICATION ====================
    // Event handler that listens for custom events dispatched by child component.
    // This method captures the data passed from child to parent using event.detail
    handleDataFromChildToParent(event) {
        // Extract the data from the event's detail property and store it in the parent property
        this.messageFromChildToParent = event.detail;
    }
}