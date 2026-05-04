# Angular Test PWA

Una aplicación web progresiva (PWA) Angular de prueba, construida automáticamente desde la rama `feature/pwa`.

## Características

- ✨ **Progressive Web App** - Instalable como una aplicación nativa
- 🔌 **Offline Support** - Service Worker para funcionamiento sin conexión
- ⚡ **Optimizada** - Compilada con producción, caché inteligente
- 🎯 **SPA Routing** - Soporte completo para Angular routing

## Uso

### Con Docker Compose (ZimaOS)

```yaml
version: '3.8'
services:
  angular-test:
    image: tu-usuario/angular-test:latest
    ports:
      - "5080:80"
    restart: unless-stopped
```

### Con Docker directamente

```bash
docker run -p 5080:80 tu-usuario/angular-test:latest
```

Accede a `http://localhost:5080`

## Puertos

- **80** (interno) - Servidor web Nginx
- **5080** (recomendado para ZimaOS) - Puerto de acceso

## Construcción desde fuente

```bash
git clone https://github.com/tu-usuario/angular-test.git
cd angular-test
git checkout feature/pwa
docker build -t angular-test:local .
docker run -p 5080:80 angular-test:local
```

## Información de la aplicación

- **Rama de origen**: `feature/pwa`
- **Servidor**: Nginx Alpine
- **Base**: Node 18 Alpine (para build)
- **Arquitecturas soportadas**: amd64, arm64

## Licencia

Consulta el repositorio original para más detalles.
