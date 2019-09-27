const axios = require('axios');
const moment = require("moment");
const _ = require("lodash");

//2 day event
//dates are 2017-05-03
//The date for the country is starting date of the two day period where most partners can attend both days in a row
//if multiple dates with the same number of partners, pick the earlier date. 
//if no two days in a row when any partners can make it, return null.

class Scheduler {
    constructor() {
        this.dates = [];
        this.beginningOfYear = moment("2017-01-01");

        for (let i = 0; i < 366; i++) {
            this.dates.push([]);
        }
    }

    mapDateToIndex = date => {
        // console.log(date.toDate())
        return date.diff(this.beginningOfYear, 'days');
    }

    // 0 0 1 3 5 13 5 0 3 5 
    getBestDate = () => {
        let maxDiff = 0;
        let startDate = null;

        let previousCount = this.dates[0].length;

        for (let i = 1; i < 366; i++) {
            let currentCount = this.dates[i].length;
            let intersection = _.intersection(this.dates[i], this.dates[i - 1])
            // if (intersection.length > 0) console.log(intersection.length)
            let attendingCount = intersection.length;

            if (attendingCount > maxDiff && currentCount > 0 && previousCount > 0) {
                maxDiff = attendingCount;
                startDate = moment(this.beginningOfYear).add(i - 1, 'days');
                // console.log(startDate.toDate(), attendingCount)
            }

            previousCount = currentCount;
        }

        this.dates.forEach((emails, i) => {
            if (emails.length != 0) {
                // console.log(moment(this.beginningOfYear.add(i, 'days')).toDate(), emails)
            }
        })

        if (startDate) console.log(startDate.toDate())

        return startDate;
    }

    pushToArray = (email, date) => {
        // console.log("1", moment(date).toDate())
        this.dates[this.mapDateToIndex(moment(date))].push(email);
        // console.log("2", this.dates[this.mapDateToIndex(moment(date))])
    }

    getAttendeesForDate(date) {
        return this.dates[this.mapDateToIndex(moment(date))]
    }
}

// class Partner {
//     constructor(firstName, lastName, email, country, availableDates) {
//         this.fName = firstName;
//         this.lName = lastName;
//         this.email = email;
//         this.country = country;
//         this.availableDates = availableDates;
//     }
// }

var canada = new Scheduler();

pushRandom = (num, country, date) => {
    for (var i = 0; i < num; i++) {
        country.pushToArray(i, date)
    }
}

// canada.pushToArray("mufeez.amjad@outlook.com", dates);
// canada.pushToArray("lol", dates2);

// var dates = "2017-03-01"

// var dates2 = "2017-03-03"

// var dates3 = "2017-03-04"
// var dates4 = "2017-03-06"
// var dates5 = "2017-03-08"
// var dates6 = "2017-03-09"

// pushRandom(9, canada, dates)
// pushRandom(2, canada, dates2)
// pushRandom(55, canada, dates3)
// pushRandom(1, canada, dates4)
// pushRandom(100, canada, dates5)
// pushRandom(101, canada, dates6)

// canada.pushToArray("lol", dates3)
canada.getBestDate()


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
            // if (countries[country].getBestDate() != null) {
            //     console.log(country, countries[country].getBestDate().toDate())
            // }
        });

        console.log(res)

        axios.post("https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=d641cd3acc4f2474d674f70b345c", res)
            .then(res => {
                console.log(res.status)
            })
    })
//     // .then(
//     //     axios.post("", {})
//     // )
