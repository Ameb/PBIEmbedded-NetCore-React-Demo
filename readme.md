# Demo PowerBI

API ASP .Net Core + frontend React (Webpack), siguiendo la plantilla de aplicación .Net Core de Visual Studio.

## Identificación y obtención de Tokens

[authetication](https://docs.microsoft.com/en-us/power-bi/developer/get-azuread-access-token)

Para usuarios externos se debe seguir el sistema de generación de Tokens, ya que es la única forma de indicarle identidades al acceder a la fuente de datos. Las cuentas con las que se identifica la aplicación para generar Tokens las llamamos master. Dichas cuentas deben conceder permisos a la aplicación desde el portal de Azure en caso de ser cuentas cuya contraseña se almacena en la aplicación. En caso de ser cuentas que se identifican por AAD, en la misma pantalla de login se les solicitará conceder permisos a la aplicación.

Para usuarios internos la identificación puede mediante [AAD](https://docs.microsoft.com/en-us/power-bi/developer/get-azuread-access-token#access-token-for-power-bi-users-user-owns-data) o almacenando los credenciales de Azure en la aplicación (como cuenta 'master'). Cuando se usa AAD, el usuario debe identificarse a través de una redirección a Azure (debe introducir usuario y contraseña en una pantalla de login de Azure).

### Obtención de Tokens

Para mostrar los reports es obligatorio un token. Este token se puede obtener con la [API de generacion de tokens](link) o usar el token de AAD. La API de generación de Token permite indicar identidades, pero su uso en producción requiere contratar una capacidad.

En caso de usar identificación por AAD los usuarios deben hacer login, y los permisos con el que acceden a los reportes son los mismos que en PowerBI.

## Mostrar los informes

La configuración que se le pasa al `embed()` en javascript es importante, ya que cualquier parámetro mal indicado da un error de identificación genérico (403).
