import { LightningElement, track, wire } from 'lwc';
import getQueryableObjects from '@salesforce/apex/SoqlBuilderController.getQueryableObjects';
import getObjectFields from '@salesforce/apex/SoqlBuilderController.getObjectFields';

/**
 * @description LWC component controller managing state, user inputs, 
 * and dynamic SOQL query string generation.
 */
export default class SoqlCheatSheet extends LightningElement {
    // Dropdown Data lists
    @track objectOptions = [];
    @track fieldOptions = [];
    
    // User Selections state variables
    @track selectedObject = '';
    @track selectedFields = [];
    @track whereClause = '';
    @track orderByField = '';
    @track orderDirection = 'ASC';
    @track limitRows = '';

    // Constants for sort direction dropdown options
    directionOptions = [
        { label: 'Ascending (ASC)', value: 'ASC' },
        { label: 'Descending (DESC)', value: 'DESC' }
    ];

    // Wire service to automatically fetch all org objects on component load
    @wire(getQueryableObjects)
    wiredObjects({ error, data }) {
        if (data) {
            // Sort objects alphabetically by label in JavaScript to save Apex CPU time
            this.objectOptions = [...data].sort((a, b) => a.label.localeCompare(b.label));
        } else if (error) {
            console.error('Error fetching objects:', error);
        }
    }

    // Wire service to fetch fields dependently whenever selectedObject changes
    @wire(getObjectFields, { objectName: '$selectedObject' })
    wiredFields({ error, data }) {
        if (data) {
            this.fieldOptions = [...data].sort((a, b) => a.label.localeCompare(b.label));
        } else if (error) {
            console.error('Error fetching fields:', error);
            this.fieldOptions = [];
        }
    }

    // Event Handlers for user interactions
    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
        // Reset dependent selections when the parent object changes
        this.selectedFields = [];
        this.whereClause = '';
        this.orderByField = '';
        this.limitRows = '';
    }

    handleFieldChange(event) {
        this.selectedFields = event.detail.value;
        // If the current ORDER BY field is removed from selected fields, clear it out
        if (this.orderByField && !this.selectedFields.includes(this.orderByField)) {
            this.orderByField = '';
        }
    }

    handleWhereChange(event) {
        this.whereClause = event.target.value;
    }

    handleOrderByChange(event) {
        this.orderByField = event.detail.value;
    }

    handleDirectionChange(event) {
        this.orderDirection = event.detail.value;
    }

    handleLimitChange(event) {
        this.limitRows = event.target.value;
    }

    // UI State Getters
    get isFieldSelectionDisabled() {
        return !this.selectedObject; // Disable if no object is chosen yet
    }

    get isOrderByDisabled() {
        return this.selectedFields.length === 0; // Disable if no fields are selected
    }

    get orderByOptions() {
        // Restrict sorting options only to fields currently picked in the dual listbox
        return this.selectedFields.map(field => {
            return { label: field, value: field };
        });
    }

    // Computed Getter: Dynamically compiles the final SOQL string based on current state
    get generatedQuery() {
        if (!this.selectedObject) {
            return 'Select an object to begin building your query...';
        }

        // Default to 'Id' if no specific fields are selected yet
        const fields = this.selectedFields.length > 0 ? this.selectedFields.join(', ') : 'Id';
        
        let query = `SELECT ${fields} \nFROM ${this.selectedObject}`;

        if (this.whereClause && this.whereClause.trim() !== '') {
            query += ` \nWHERE ${this.whereClause.trim()}`;
        }

        if (this.orderByField) {
            query += ` \nORDER BY ${this.orderByField} ${this.orderDirection}`;
        }

        if (this.limitRows && this.limitRows > 0) {
            query += ` \nLIMIT ${this.limitRows}`;
        }

        return query;
    }
}