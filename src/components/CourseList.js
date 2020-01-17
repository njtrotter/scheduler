import React, { useState} from 'react';
 import "rbx/index.css";
 import { Button} from "rbx";
 import firebase from 'firebase/app';
 import 'firebase/auth';
 import 'firebase/database';

    // FIREBASE
    const firebaseConfig = {
        apiKey: "AIzaSyCqyd9zjbsjVw4Lf9eF85iQ2JxzH1md0Sw",
        authDomain: "quickreact-1b2f9.firebaseapp.com",
        databaseURL: "https://quickreact-1b2f9.firebaseio.com",
        projectId: "quickreact-1b2f9",
        storageBucket: "quickreact-1b2f9.appspot.com",
        messagingSenderId: "664627891654",
        appId: "1:664627891654:web:d22137f3d6d1445a1536c7",
        measurementId: "G-38SQN2L0RX"
    };
    const CourseList = ({ courses, user }) => {
        const [term, setTerm] = useState('Fall');
        const [selected, toggle] = useSelection();
        const termCourses = courses.filter(course => term === getCourseTerm(course));

        return (
        <React.Fragment>
            <TermSelector state={ { term, setTerm } } />
            <Button.Group>
            { termCourses.map(course =>
                <Course key={ course.id } course={ course }
                state={ { selected, toggle } }
                user={ user } />) }
            </Button.Group>
        </React.Fragment>
        );
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database().ref();
    const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};
    const buttonColor = selected => (
        selected ? 'success' : null
    );
        const days = ['M', 'Tu', 'W', 'Th', 'F'];
        const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;
        const moveCourse = course => {
            const meets = prompt('Enter new meeting data, in this format:', course.meets);
            if (!meets) return;
            const {days} = timeParts(meets);
            if (days) saveCourse(course, meets); 
            else moveCourse(course);
        };

    const timeParts = meets => {
        const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];
        return !match ? {} : {
        days,
        hours: {
            start: hh1 * 60 + mm1 * 1,
            end: hh2 * 60 + mm2 * 1
        }
        };
    };

    const saveCourse = (course, meets) => {
        db.child('courses').child(course.id).update({meets})
        .catch(error => alert(error));
    };

    const getCourseNumber = course => (
        course.id.slice(1, 4)
    )

    const hasConflict = (course, selected) => (
        selected.some(selection => course !== selection && courseConflict(course, selection))
    );

    const courseConflict = (course1, course2) => (
        course1 !== course2
        && getCourseTerm(course1) === getCourseTerm(course2)
        && timeConflict(course1, course2)
    );

    const useSelection = () => {
        const [selected, setSelected] = useState([]);
        const toggle = (x) => {
        setSelected(selected.includes(x) ? selected.filter(y => y !== x) : [x].concat(selected))
        };
        return [ selected, toggle ];
    };

    const getCourseTerm = course => (
        terms[course.id.charAt(0)]
    );

    const TermSelector = ({ state }) => (
        <Button.Group hasAddons>
        { Object.values(terms)
            .map(value => 
                <Button key={value}
                color={ buttonColor(value === state.term) }
                onClick={ () => state.setTerm(value) }
                >
                { value }
                </Button>
            )
        }
        </Button.Group>
    );

    const daysOverlap = (days1, days2) => ( 
        days.some(day => days1.includes(day) && days2.includes(day))
    );

    const hoursOverlap = (hours1, hours2) => (
        Math.max(hours1.start, hours2.start)
        < Math.min(hours1.end, hours2.end)
    );

    const timeConflict = (course1, course2) => (
        daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
    );
    const Course = ({ course, state, user }) => (
        <Button color={ buttonColor(state.selected.includes(course)) }
        onClick={ () => state.toggle(course) }
        onDoubleClick={ user ? () => moveCourse(course) : null }
        disabled={ hasConflict(course, state.selected) }
        >
        { getCourseTerm(course) } CS { getCourseNumber(course) }: { course.title }
        </Button>
    );


    export default CourseList; 