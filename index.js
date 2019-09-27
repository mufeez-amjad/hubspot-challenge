const axios = require('axios');
const moment = require("moment");
const _ = require("lodash");

// 2 day event
// dates are 2017-05-03
// date for the country is starting date of two day period where most partners can attend both days in a row
// if multiple dates with same number of partners, pick the earlier date. 
// if no two days in a row when any partners can make it, return null.

class Scheduler {
    constructor() {
        this.dates = [];
        this.beginningOfYear = moment("2017-01-01");

        for (let i = 0; i < 366; i++) {
            this.dates.push([]);
        }
    }

    mapDateToIndex = date => date.diff(this.beginningOfYear, 'days');

    getBestDate = () => {
        let maxCount = 0;
        let startDate = null;

        let previousCount = this.dates[0].length;

        for (let i = 1; i < 366; i++) {
            let currentCount = this.dates[i].length;
            let attendBothDays = _.intersection(this.dates[i], this.dates[i - 1])
            let attendingCount = attendBothDays.length;

            if (attendingCount > maxCount && currentCount > 0 && previousCount > 0) {
                maxCount = attendingCount;
                startDate = moment(this.beginningOfYear).add(i - 1, 'days');
            }

            previousCount = currentCount;
        }

        return startDate;
    }

    pushToArray = (email, date) => this.dates[this.mapDateToIndex(moment(date))].push(email);


    getAttendeesForDate = (date) => this.dates[this.mapDateToIndex(moment(date))]
}

axios.get("https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=d641cd3acc4f2474d674f70b345c")
    .then(res => {
        const { data } = res;
        const { partners } = data;

        const countries = {};

        partners.forEach(partner => {
            if (!countries[partner.country]) {
                countries[partner.country] = new Scheduler();
            }
            partner.availableDates.forEach(date => countries[partner.country].pushToArray(partner.email, date))
        })

        res = {
            countries: []
        }
        Object.keys(countries).forEach(country => {
            let bestDate = countries[country].getBestDate().toISOString().substr(0, "2017-06-01".length);
            let attendees = countries[country].getAttendeesForDate(bestDate);
            ans = {
                attendeeCount: attendees.length,
                attendees,
                name: country,
                startDate: bestDate
            }

            res.countries.push(ans)
        });

        axios.post("https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=d641cd3acc4f2474d674f70b345c", res)
            .then(res => {
                console.log(res.status)
            })
    })