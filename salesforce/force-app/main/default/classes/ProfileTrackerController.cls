public with sharing class ProfileTrackerController {

    @AuraEnabled(cacheable=true)
    public static List<Profile__c> getProfiles() {
        return [
            SELECT Id, Name, Street__c, City__c, State__c, PostalCode__c, Country__c
            FROM Profile__c
            ORDER BY Name ASC
        ];
    }

    @AuraEnabled
    public static Profile__c saveProfile(Profile__c profile) {
        upsert profile;
        return profile;
    }

    @AuraEnabled
    public static void deleteProfile(Id profileId) {
        delete [SELECT Id FROM Profile__c WHERE Id = :profileId];
    }
}
