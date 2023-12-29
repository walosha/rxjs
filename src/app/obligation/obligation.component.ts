import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-obligation',
    templateUrl: './obligation.component.html',
    styleUrls: ['./obligation.component.css']
})

export class ObligationComponent implements OnInit {  
    
    obligation_list = [
        {
            "modifiedTime": "String",
            "apiName": "String",
            "taskOwners": [
                {
                    "displayName": "Raj",
                    "id": "String"
                },
                {
                    "displayName": "David",
                    "id": "String"
                }
            ],
            "instances": [
                {
                    "sequenceNumber": '"Integer"',
                    "isOverDue": "Boolean",
                    "isCurrent": "Boolean",
                    "assignedBy": {
                        "displayName": "String",
                        "id": 'Long'
                    },
                    "dueOn": "String",
                    "id": "String",
                    "actions": [],
                    "createdOn": "String",
                    "users": [
                        {
                            "displayName": "String",
                            "id": "String"
                        }
                    ],
                    "status": "Integer"
                }
            ],
            "recurring": {
                "dueOnTermination": true,
                "timePeriod": "Integer",
                "exclude": [
                    "Integer",
                    "Integer"
                ],
                "startDateString": "2022-04-04",
                "startsOn": "Integer",
                "startDate": "String",
                "frequency": "Integer"
            },
            "addedBy": {
                "displayName": "David",
                "id": "String"
            },
            "priority": "High",
            "hasTask": "Boolean",
            "name": "Obligation 1",
            "addedTime": "String",
            "modifiedBy": {
                "displayName": "String",
                "id": "String"
            },
            "category": {
                "apiName": "String",
                "displayName": "Sign"
            },
            "status": "Active"
        },
        {
            "modifiedTime": "String",
            "apiName": "String",
            "taskOwners": [
                {
                    "displayName": "Lezer",
                    "id": "String"
                }
            ],
            "instances": [
                {
                    "sequenceNumber": '"Integer"',
                    "isOverDue": "Boolean",
                    "isCurrent": "Boolean",
                    "assignedBy": {
                        "displayName": "String",
                        "id": 'Long'
                    },
                    "dueOn": "String",
                    "id": "String",
                    "actions": [],
                    "createdOn": "String",
                    "users": [
                        {
                            "displayName": "String",
                            "id": "String"
                        }
                    ],
                    "status": "Integer"
                }
            ],
            "recurring": {
                "dueOnTermination": true,
                "timePeriod": "Integer",
                "exclude": [
                    "Integer",
                    "Integer"
                ],
                "startDateString": "2022-04-06",
                "startsOn": "Integer",
                "startDate": "String",
                "frequency": "Integer"
            },
            "addedBy": {
                "displayName": "Raj",
                "id": "String"
            },
            "priority": "Low",
            "hasTask": "Boolean",
            "name": "Obligation 2",
            "addedTime": "String",
            "modifiedBy": {
                "displayName": "String",
                "id": "String"
            },
            "category": {
                "apiName": "String",
                "displayName": "NDA"
            },
            "status": "Closed"
        },
        
    ];

    constructor(private fb: FormBuilder, private httpClient: HttpClient) { }
    
    ngOnInit() {
        
    }
}
