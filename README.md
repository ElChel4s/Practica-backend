# Sistema de Registro Universitario

---

## Documentación Técnica y Funcional

---

### Módulo (a): Login, Registro, Autenticación con JWT y Roles

#### 1. Descripción Funcional

Permite a los usuarios registrarse, iniciar sesión y acceder a recursos protegidos según su rol (**ADMIN**, **DOCENTE**, **ESTUDIANTE**). Utiliza JWT para la autenticación sin estado.

#### 2. Componentes y Código Explicado

##### a) Controlador de Autenticación

Gestiona los endpoints de registro y login.

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private JwtUtils jwtUtils;

    // Registro de usuario
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UsuarioDTO usuarioDTO) {
        usuarioService.registrarUsuario(usuarioDTO);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario registrado correctamente"));
    }

    // Login de usuario
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Usuario usuario = usuarioService.validarCredenciales(loginRequest.getEmail(), loginRequest.getPassword());
        String token = jwtUtils.generateToken(usuario);
        return ResponseEntity.ok(Map.of("token", token, "tipo", "Bearer"));
    }
}
```

##### b) Modelo de Usuario y Rol

Define la estructura de los usuarios y sus roles.

```java
@Entity
public class Usuario {
    @Id @GeneratedValue
    private Long id;

    @NotBlank
    private String nombre;

    @Email @NotBlank
    private String email;

    @NotBlank
    private String password; // Se almacena encriptada

    @Enumerated(EnumType.STRING)
    private Rol rol;
}

public enum Rol {
    ADMIN, DOCENTE, ESTUDIANTE
}
```

##### c) Servicio de Usuario

Lógica de negocio para registrar y autenticar usuarios.

```java
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registrarUsuario(UsuarioDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setRol(dto.getRol());
        usuarioRepository.save(usuario);
    }

    public Usuario validarCredenciales(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        return usuario;
    }
}
```

##### d) Utilidad JWT

Genera y valida los tokens JWT.

```java
@Component
public class JwtUtils {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateToken(Usuario usuario) {
        return Jwts.builder()
            .setSubject(usuario.getEmail())
            .claim("rol", usuario.getRol().name())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser().setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody().getSubject();
    }
}
```

##### e) Filtro de Seguridad JWT

Intercepta las peticiones y valida el JWT.

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtils.validateToken(token)) {
                String email = jwtUtils.getEmailFromToken(token);
                Usuario usuario = usuarioService.findByEmail(email);
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(usuario, null, List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol())));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        chain.doFilter(request, response);
    }
}
```

##### f) Configuración de Seguridad

Define las reglas de acceso y la integración con JWT.

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/auth/**", "/swagger-ui.html", "/swagger-ui/**", "/api-docs/**").permitAll()
                .antMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
```

#### 3. Buenas Prácticas Aplicadas

- Contraseñas encriptadas con BCrypt.
- JWT firmado y con expiración.
- Validaciones en DTOs con anotaciones como `@Email`, `@NotBlank`.
- Roles y permisos gestionados con anotaciones y configuración.
- Endpoints protegidos y separación clara entre rutas públicas y privadas.
- Swagger para documentación y pruebas de los endpoints.

---

### Módulo (b): CRUD de Estudiantes con Validaciones

#### 1. Descripción Funcional

Este módulo permite gestionar los estudiantes del sistema universitario. Incluye operaciones para crear, consultar, actualizar y eliminar estudiantes, asegurando la integridad de los datos mediante validaciones automáticas y personalizadas.

#### 2. Componentes y Código Explicado

##### a) Controlador de Estudiantes

```java
@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {

    @Autowired
    private IEstudianteService estudianteService;

    @PostMapping
    public ResponseEntity<EstudianteDTO> crearEstudiante(@Valid @RequestBody EstudianteDTO estudianteDTO) {
        EstudianteDTO creado = estudianteService.crearEstudiante(estudianteDTO);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EstudianteDTO>> obtenerTodos() {
        return ResponseEntity.ok(estudianteService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstudianteDTO> obtenerPorId(@PathVariable Long id) {
        EstudianteDTO estudiante = estudianteService.obtenerPorId(id);
        return estudiante != null ? ResponseEntity.ok(estudiante) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstudianteDTO> actualizar(@PathVariable Long id, @Valid @RequestBody EstudianteDTO dto) {
        EstudianteDTO actualizado = estudianteService.actualizarEstudiante(id, dto);
        return actualizado != null ? ResponseEntity.ok(actualizado) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        estudianteService.eliminarEstudiante(id);
        return ResponseEntity.noContent().build();
    }
}
```

##### b) DTO y Validaciones

```java
public class EstudianteDTO {
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Email(message = "El email debe ser válido")
    @NotBlank(message = "El email es obligatorio")
    private String email;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;
}
```

##### c) Servicio de Estudiantes

```java
@Service
public class EstudianteServiceImpl implements IEstudianteService {

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Override
    public EstudianteDTO crearEstudiante(EstudianteDTO dto) {
        if (estudianteRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        Estudiante estudiante = new Estudiante();
        estudiante.setNombre(dto.getNombre());
        estudiante.setEmail(dto.getEmail());
        estudiante.setFechaNacimiento(dto.getFechaNacimiento());
        estudianteRepository.save(estudiante);
        return mapToDTO(estudiante);
    }
}
```

##### d) Manejo de Excepciones Personalizado

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errores.put(error.getField(), error.getDefaultMessage()));
        return new ResponseEntity<>(errores, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.BAD_REQUEST);
    }
}
```

#### 3. Buenas Prácticas Aplicadas

- Uso de DTOs para separar la capa de presentación de la lógica de negocio.
- Validaciones automáticas con anotaciones (`@NotBlank`, `@Email`, etc.).
- Validaciones personalizadas en el servicio.
- Manejo centralizado de excepciones.
- Métodos RESTful claros y consistentes.
- Documentación automática con Swagger.

---

# Manual de Usuario - Registro Universitario

Bienvenido al sistema de **Registro Universitario**. Este manual te guiará en el uso de la página para registrar, consultar y administrar información universitaria.

---

## Índice

1. [Acceso al sistema](#acceso-al-sistema)
2. [Registro de usuario](#registro-de-usuario)
3. [Inicio de sesión](#inicio-de-sesión)
4. [Registro de estudiantes](#registro-de-estudiantes)
5. [Consulta de registros](#consulta-de-registros)
6. [Gestión de materias](#gestión-de-materias)
7. [Inscripción de materias](#inscripción-de-materias)
8. [Edición y eliminación](#edición-y-eliminación)
9. [Cerrar sesión](#cerrar-sesión)

---

## Acceso al sistema

1. Abre tu navegador web.
2. Ingresa la dirección URL proporcionada por la universidad.
3. Espera a que cargue la página principal.

---

## Registro de usuario

1. Haz clic en el botón **"Registrarse"**.
2. Completa el formulario con tus datos personales (nombre, correo, contraseña, etc.).
3. Haz clic en **"Enviar"**.
4. Recibirás un mensaje de confirmación.
![image](https://github.com/user-attachments/assets/b253ae3c-099b-485f-836c-a4eed3ff99d0)

---

## Inicio de sesión

1. Ingresa tu correo y contraseña en el formulario de inicio de sesión.
2. Haz clic en **"Iniciar sesión"**.
3. Si los datos son correctos, accederás al panel principal.
![image](https://github.com/user-attachments/assets/b7a80112-abb1-4424-8ccd-6128000bec28)

---

## Registro de estudiantes

1. Ve al menú **"Estudiantes"** y selecciona **"Registrar"**.
2. Completa los campos requeridos (nombre, matrícula, carrera, etc.).
3. Haz clic en **"Guardar"**.
4. El estudiante quedará registrado en el sistema.
![image](https://github.com/user-attachments/assets/dd6d8602-8e80-4145-95b9-e4bff75c3b92)

---

## Consulta de registros

1. Accede a la sección **"Lista de estudiantes"**.
2. Utiliza el buscador para filtrar por nombre, matrícula o carrera.
3. Haz clic en un registro para ver detalles.
![image](https://github.com/user-attachments/assets/ba53c903-40dd-4136-a1df-b2993a4f8224)

---

## Gestión de materias

### Registrar nueva materia

1. Ve al menú **"Materias"** y selecciona **"Registrar materia"**.
2. Completa los campos requeridos (nombre de la materia, código, créditos, etc.).
3. Haz clic en **"Guardar"**.
4. La materia quedará registrada en el sistema.
![image](https://github.com/user-attachments/assets/ccfe353c-a8dc-4820-9a6b-36dbf925e43c)

### Consultar materias

1. Accede a la sección **"Lista de materias"**.
2. Utiliza el buscador para filtrar por nombre o código.
3. Haz clic en una materia para ver detalles.
![image](https://github.com/user-attachments/assets/4aa4b75c-d7df-4b01-b5ac-4908fd91be55)

---

## Inscripción de materias

1. Ve al menú **"Inscripciones"** y selecciona **"Nueva inscripción"**.
2. Selecciona el estudiante y las materias a inscribir.
3. Haz clic en **"Inscribir"**.
4. La inscripción quedará registrada y podrás consultarla en la sección de inscripciones.
5. ![image](https://github.com/user-attachments/assets/ee4e46bf-b91d-48ac-9b25-daa2f75d025a)


### Consultar inscripciones

1. Accede a la sección **"Lista de inscripciones"**.
2. Utiliza el buscador para filtrar por estudiante o materia.
3. Haz clic en una inscripción para ver detalles.
![image](https://github.com/user-attachments/assets/d5c39412-3710-4864-b71d-043299bd854e)

---

## Edición y eliminación

1. En las listas de estudiantes, materias o inscripciones, selecciona el registro que deseas modificar o eliminar.
2. Haz clic en **"Editar"** para modificar los datos y luego en **"Guardar"**.
3. Haz clic en **"Eliminar"** para borrar el registro (confirma la acción).
![image](https://github.com/user-attachments/assets/c93d706b-35ab-4419-985f-cd382d1fec0d)

![image](https://github.com/user-attachments/assets/1852bab9-bb93-4a4e-b79f-bd159a31fbad)

![image](https://github.com/user-attachments/assets/95eae200-2ec4-4e0f-8a14-5023c3d2ee29)

![image](https://github.com/user-attachments/assets/da3c6756-62c6-43a6-9a3a-c83dc80ffde2)

---

## Cerrar sesión

1. Haz clic en tu nombre de usuario (parte inferior derecha).
2. Selecciona **"Cerrar sesión"**.
![image](https://github.com/user-attachments/assets/2b255aad-f68d-4243-9ef8-7b16fb438e4a)

---

¡Gracias por usar el sistema de Registro Universitario!
