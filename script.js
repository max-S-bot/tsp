// python -m http.server

const w = 200;
const h = 300;
const numPoints = 20;
const numTrips = 40;
const numGens = 222;
const maxTripL = numPoints*Math.sqrt(w*w+h*h);

window.addEventListener("load",run);

function run() {
    let trips = createTrips();
    let fittestOfGen = [fittestMember(trips)];
    for (let i=0; i<numGens; i++) {
        trips = crossover(weightedPool(trips));
        fittestOfGen.push(fittestMember(trips));
    }
    let fm = "Fittest member of generation: "
    fittestOfGen = fittestOfGen.map(trip => tripFitness(trip));
    let str = fm+fittestOfGen.join("<br>"+fm);
    document.getElementById("sol").innerHTML = str;
}

function createPoints() {
    let points = [];
    for (let i=0; i<numPoints; i++) {
        points.push({
            "x": Math.floor((w+1)*Math.random()),
            "y": Math.floor((h+1)*Math.random())
        });
    }
    return points;
}

function d(p,q) {
    let dx2 = Math.pow(p.x-q.x,2);
    let dy2 = Math.pow(p.y-q.y,2);
    return Math.sqrt(dx2+dy2);
}

function createTrips() {
    let points = createPoints();
    let start = Math.floor(Math.random()*numPoints);
    start = points.splice(start,1);
    let trips = [];
    for (let i=0; i<numTrips; i++) {
        trips.push(start.concat(createTrip(points)).concat(start));
    }
    return trips;
}

function createTrip(points) {
    let trip = [];
    let pointsTemp = [].concat(points);
    for (let i=1; i<numPoints; i++) {
        let p = Math.floor(pointsTemp.length*Math.random());
        trip.push(pointsTemp[p]);
        pointsTemp.splice(p,1);
    }
    return trip;
}

function tripFitness(trip) {
    let dist = 0;
    for (let i=0; i<numPoints; i++) {
        dist+=d(trip[i],trip[i+1]);
    }
    return 1-dist/maxTripL;
}

function tripsFitness(trips) {
    return trips.map(trip=>tripFitness(trip));
}

function weightedPool(trips) {
    let tFitness = tripsFitness(trips);
    let pool = [];
    let scalar = 100;
    for (let i=0; i<numTrips; i++) {
        for (let j=0; j<scalar*tFitness[i]; j++) {
            pool.push(trips[i]);
        }
    }
    return pool;
}

function crossover(pool) {
    let nextGen = [];
    for (let i=0; i<numTrips; i++) {
        let p1 = pool[Math.floor(pool.length*Math.random())];
        let p2 = pool[Math.floor(pool.length*Math.random())];
        let p = [p1,p2];
        let newTrip = [p[0][0]];
        for (let j=1; j<numPoints; j++) {
            newTrip.push(getNext(p[j%2],newTrip));
        }
        nextGen.push(newTrip.concat([p[0][0]]));
    }
    return nextGen;
}

function getNext(p,trip) {
    let next = 1+p.indexOf(trip[trip.length-1]);
    while(trip.includes(p[next%(numPoints+1)])) {
        next++;
    }
    return p[next%(numPoints+1)];
}

function fittestMember(gen) {
    let fittest=gen[0];
    for (let i=1; i<numTrips; i++) {
        if(tripFitness(gen[i])>tripFitness(fittest)) {
            fittest = gen[i];
        }
    }
    return fittest;
}