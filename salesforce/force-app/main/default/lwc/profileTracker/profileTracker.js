import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProfiles from '@salesforce/apex/ProfileTrackerController.getProfiles';
import deleteProfile from '@salesforce/apex/ProfileTrackerController.deleteProfile';

export default class ProfileTracker extends LightningElement {
    @track editRecordId = null;
    @track isLoading = false;

    _wiredProfilesResult;

    @wire(getProfiles)
    wiredProfiles(result) {
        this._wiredProfilesResult = result;
    }

    get profiles() {
        return this._wiredProfilesResult?.data ?? [];
    }

    get hasProfiles() {
        return this.profiles.length > 0;
    }

    get formTitle() {
        return this.editRecordId ? 'Edit Profile' : 'Add New Profile';
    }

    get saveLabel() {
        return this.editRecordId ? 'Update' : 'Save';
    }

    handleSuccess() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: this.editRecordId ? 'Profile updated.' : 'Profile saved.',
                variant: 'success'
            })
        );
        this.editRecordId = null;
        refreshApex(this._wiredProfilesResult);
    }

    handleError(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: event.detail.detail,
                variant: 'error'
            })
        );
    }

    handleEdit(event) {
        this.editRecordId = event.currentTarget.dataset.id;
        this.template.querySelector('lightning-record-edit-form').scrollIntoView({ behavior: 'smooth' });
    }

    handleCancelEdit() {
        this.editRecordId = null;
    }

    async handleDelete(event) {
        const id = event.currentTarget.dataset.id;
        if (!confirm('Delete this profile?')) return;
        this.isLoading = true;
        try {
            await deleteProfile({ profileId: id });
            this.dispatchEvent(
                new ShowToastEvent({ title: 'Deleted', message: 'Profile deleted.', variant: 'success' })
            );
            await refreshApex(this._wiredProfilesResult);
        } catch (e) {
            this.dispatchEvent(
                new ShowToastEvent({ title: 'Error', message: e.body?.message ?? 'Delete failed.', variant: 'error' })
            );
        } finally {
            this.isLoading = false;
        }
    }
}
