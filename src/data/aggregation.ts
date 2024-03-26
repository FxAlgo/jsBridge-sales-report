import "@resconet/jsbridge";
// import "styles.css"

export function aggregateOrders(): void {
	MobileCRM.bridge.alert("Test");
	/*
    const orderFetchEntity = new MobileCRM.FetchXml.Entity('salesorder');
    // Add attributes what we will aggregate by
    const idAttr = new MobileCRM.FetchXml.Attribute('salesorderid'); // Use for Count of orders | we need to st alias for aggregation
    idAttr.alias = 'ID_CNT';
    idAttr.aggregate = 'count'; // NOTE: Aggregate function is case sensitive expression
    const amountSumAttr = new MobileCRM.FetchXml.Attribute('totalamount'); // Use for SUM AMOUNT of orders
    amountSumAttr.alias = 'AMOUNT_SUM';
    amountSumAttr.aggregate = 'sum';
    const amountMaxAttr = new MobileCRM.FetchXml.Attribute('totalamount'); // Use for MAX AMOUNT of orders
    amountMaxAttr.alias = 'AMOUNT_MAX';
    amountMaxAttr.aggregate = 'max';
    const amountMinAttr = new MobileCRM.FetchXml.Attribute('totalamount'); // Use for MIN AMOUNT of orders
    amountMinAttr.alias = 'AMOUNT_MIN';
    amountMinAttr.aggregate = 'min';
    const amountAvgAttr = new MobileCRM.FetchXml.Attribute('totalamount'); // Use for AconstAGE AMOUNT of orders
    amountAvgAttr.alias = 'AMOUNT_AVG';
    amountAvgAttr.aggregate = 'avg';
    // PUSH Attributes to FetchXml entity
    orderFetchEntity.attributes.push(idAttr, amountSumAttr, amountMaxAttr, amountMinAttr, amountAvgAttr);

    const fetch = new MobileCRM.FetchXml.Fetch(orderFetchEntity);
    fetch.aggregate = true; // Set this attribute to true to allow aggregation functions.
    fetch.execute('Array', function (res) {
        if (res.length < 1) {
            MobileCRM.bridge.alert('Not any sales order entity exists.');
        } else {
            const info =
                'Sales order info: \n\n Count: ' +
                res[0][0] +
                '\n Sum amount: ' +
                res[0][1] +
                '\n Max amount: ' +
                res[0][2] +
                '\n Min amount: ' +
                res[0][3] +
                '\n Aconstage amount: ' +
                res[0][4];
            MobileCRM.bridge.alert(info);
        }
    });
    // eslint-disable-next-line multiline-comment-style
    */
}
