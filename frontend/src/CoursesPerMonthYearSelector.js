function CoursesPerMonthYearSelector() {

    const fetchData = () => {
        const response = fetch(`${API_URL}/coursesStartDate`);
        responseJson.current = response.json();
        const dataForEachYear = (responseJson.current).map(element => 
            [element[0], (JSON.parse(element[1].replace(/'/g, '"')).map(elem => [parseInt(elem[0].split("-")[1]), parseInt(elem[1])]))]
        );
        console.log(dataForEachYear);
        //dataForEachYear.sort((a, b) => b[1][1][0] - a[1][1][0]);
        setStartDateJson(dataForEachYear);
    }

    useEffect(() => {
        fetchData();
      },[]);
}