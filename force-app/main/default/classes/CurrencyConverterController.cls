public with sharing class CurrencyConverterController {

    @AuraEnabled
    public static Decimal convertCurrency(String fromCurrency, String toCurrency, Decimal amount) {
        
        if (String.isBlank(fromCurrency) || String.isBlank(toCurrency) || amount == null) {
            throw new AuraHandledException(
                'Invalid input: Currency codes and amount are required.'
            );
        }

        try {
            HttpRequest request = new HttpRequest();

            String endpoint =
                'callout:ExchangeRate_API/pair/' +
                EncodingUtil.urlEncode(fromCurrency, 'UTF-8') + '/' +
                EncodingUtil.urlEncode(toCurrency, 'UTF-8') + '/' +
                amount;

            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setTimeout(10000);

            HttpResponse response = new Http().send(request);

            if (response.getStatusCode() != 200) {
                // 1. Log the exact URL that was sent to the server
                System.debug(LoggingLevel.ERROR, 'Attempted URL: ' + request.getEndpoint());
                
                // 2. Log the response body to see the API's exact error message
                System.debug(LoggingLevel.ERROR, 'API Response Body: ' + response.getBody());
                
                throw new AuraHandledException(
                    'HTTP Request failed with status code: ' + response.getStatusCode()
                );
            }

            Map<String, Object> jsonMap = (Map<String, Object>) JSON.deserializeUntyped( response.getBody() );
            if (String.valueOf(jsonMap.get('result')) != 'success') {
                String errorType = String.valueOf(jsonMap.get('error-type'));
                throw new AuraHandledException( 'API Error: ' + errorType );
            }

            Decimal convertedAmount = Decimal.valueOf( String.valueOf( jsonMap.get('conversion_result') ));

            return convertedAmount.setScale(2, RoundingMode.HALF_UP);
        } catch (AuraHandledException e) {
            throw e;

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR,'API Callout Error: ' + e.getMessage());
            throw new AuraHandledException('Currency conversion failed: ' + e.getMessage());
        }
    }
}