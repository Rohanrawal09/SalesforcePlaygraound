import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getNotes from '@salesforce/apex/StickyNoteController.getNotes';
import createNote from '@salesforce/apex/StickyNoteController.createNote';
import updateNote from '@salesforce/apex/StickyNoteController.updateNote';
import deleteNote from '@salesforce/apex/StickyNoteController.deleteNote';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import STICKY_NOTE_OBJECT from '@salesforce/schema/Sticky_Note__c';
import COLOR_FIELD from '@salesforce/schema/Sticky_Note__c.Color__c';
import PRIORITY_FIELD from '@salesforce/schema/Sticky_Note__c.Priority__c';
import CATEGORY_FIELD from '@salesforce/schema/Sticky_Note__c.Category__c';

export default class StickyNotes extends LightningElement {

    // ==============================
    // Variables
    // ==============================

    notes = [];
    wiredResult;

    title = '';
    description = '';
    color = 'Yellow';
    priority = 'Medium';
    category = '';
    reminderDate = null;

    isPinned = false;
    isLoading = false;
    isEditMode = false;

    recordId;

    colorOptions = [];
    priorityOptions = [];
    categoryOptions = [];

    recordTypeId;

    // ==============================
    // Getter
    // ==============================

    get saveButtonLabel() {
        return this.isEditMode ? 'Update Note' : 'Save Note';
    }

    // ==============================
    // Object Info
    // ==============================

    @wire(getObjectInfo, {
        objectApiName: STICKY_NOTE_OBJECT
    })
    objectInfo({ data, error }) {

        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            console.error(error);
        }

    }

    // ==============================
    // Priority Picklist
    // ==============================

    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: PRIORITY_FIELD
    })
    priorityPicklist({ data }) {

        if (data) {
            this.priorityOptions = data.values;
        }

    }

    // ==============================
    // Color Picklist
    // ==============================

    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: COLOR_FIELD
    })
    colorPicklist({ data }) {

        if (data) {
            this.colorOptions = data.values;
        }

    }

    // ==============================
    // Category Picklist
    // ==============================

    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: CATEGORY_FIELD
    })
    categoryPicklist({ data }) {

        if (data) {
            this.categoryOptions = data.values;
        }

    }

    // ==============================
    // Load Notes
    // ==============================

    @wire(getNotes)
    wiredNotes(result) {

        this.wiredResult = result;

        if (result.data) {
            this.notes = result.data;
        } else if (result.error) {
            this.showToast(
                'Error',
                result.error.body.message,
                'error'
            );
        }

    }

    // ==============================
    // Input Handlers
    // ==============================

    handleTitleChange(event) {
        this.title = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleColorChange(event) {
        this.color = event.detail.value;
    }

    handlePriorityChange(event) {
        this.priority = event.detail.value;
    }

    handleCategoryChange(event) {
        this.category = event.detail.value;
    }

    handleReminderDateChange(event) {
        this.reminderDate = event.target.value;
    }

    // ==============================
    // Save
    // ==============================

    async handleSave() {

        this.isLoading = true;

        const note = {
            Title__c: this.title,
            Description__c: this.description,
            Color__c: this.color,
            Priority__c: this.priority,
            Category__c: this.category,
            Reminder_Date__c: this.reminderDate,
            IsPinned__c: this.isPinned,
            Archived__c: false
        };

        try {

            if (this.isEditMode) {

                note.Id = this.recordId;

                await updateNote({
                    updatedNote: note
                });

                this.showToast(
                    'Success',
                    'Note Updated Successfully',
                    'success'
                );

            } else {

                await createNote({
                    note: note
                });

                this.showToast(
                    'Success',
                    'Note Created Successfully',
                    'success'
                );

            }

            this.resetForm();

            await refreshApex(this.wiredResult);

        } catch (error) {

            this.showToast(
                'Error',
                error.body.message,
                'error'
            );

        } finally {

            this.isLoading = false;

        }

    }

    // ==============================
    // Edit
    // ==============================

    handleEdit(event) {

        const noteId = event.currentTarget.dataset.id;

        const selectedNote = this.notes.find(
            note => note.Id === noteId
        );

        if (!selectedNote) {
            return;
        }

        this.recordId = selectedNote.Id;
        this.title = selectedNote.Title__c;
        this.description = selectedNote.Description__c;
        this.color = selectedNote.Color__c;
        this.priority = selectedNote.Priority__c;
        this.category = selectedNote.Category__c;
        this.reminderDate = selectedNote.Reminder_Date__c;
        this.isPinned = selectedNote.IsPinned__c;

        this.isEditMode = true;
    }

    // ==============================
    // Delete
    // ==============================

    async handleDelete(event) {

        this.isLoading = true;

        try {

            await deleteNote({
                noteId: event.currentTarget.dataset.id
            });

            this.showToast(
                'Success',
                'Note Deleted Successfully',
                'success'
            );

            await refreshApex(this.wiredResult);

        } catch (error) {

            this.showToast(
                'Error',
                error.body.message,
                'error'
            );

        } finally {

            this.isLoading = false;

        }

    }

    // ==============================
    // Cancel
    // ==============================

    handleCancel() {
        this.resetForm();
    }

    // ==============================
    // Reset Form
    // ==============================

    resetForm() {

        this.recordId = null;
        this.title = '';
        this.description = '';
        this.color = 'Yellow';
        this.priority = 'Medium';
        this.category = '';
        this.reminderDate = null;
        this.isPinned = false;
        this.isEditMode = false;

    }

    // ==============================
    // Toast
    // ==============================

    showToast(title, message, variant) {

        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );

    }

}