// Import the @api decorator to expose public properties
import { LightningElement, api } from 'lwc';

export default class ChildComponent extends LightningElement {
    
    // The @api decorator turns these into public properties. 
    // This allows the Parent component to push data down into this Child component.
    @api messageFromParentToChild; 
    @api childUsernameFromParent; 
    @api childAccountInfoFromParent; 

    // This property will receive the array of Accounts from the Parent's SOQL query.
    @api childSoqlAccountDetailFromParent; 

    @api childSoqlLeadDetailImperativelyFromParent


    /**
     * Handles click event from child component
     * Creates a custom event with a message and dispatches it to the parent component
     */
    childHandleClick() {
        // Define the message payload to send to the parent
        const message = 'Hello from Child!';

        // Create a custom event with the message data
        // The 'detail' property carries the payload that parent will receive
        const event = new CustomEvent('childmessagechange', {
            detail: message
        });

        // Dispatch the event up the component hierarchy to the parent
        this.dispatchEvent(event);
    }
}