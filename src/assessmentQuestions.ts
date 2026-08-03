export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SubjectiveQuestion {
  id: string;
  prompt: string;
  guidelines: string;
  sampleKeywords: string[]; // keywords used for auto-grading/criteria
  defaultInstructorFeedback: string;
}

export interface ModuleQuiz {
  moduleId: string;
  title: string;
  objectiveQuestions: MultipleChoiceQuestion[];
  subjectiveQuestion: SubjectiveQuestion;
}

export interface OverallCourseAssessment {
  trackId: string;
  title: string;
  objectiveQuestions: MultipleChoiceQuestion[];
  subjectiveQuestion: SubjectiveQuestion;
}

export const MODULE_QUIZZES: Record<string, ModuleQuiz> = {
  // HARDWARE TRACK
  'hw-mod-1': {
    moduleId: 'hw-mod-1',
    title: 'Module 1: Foundations of Microcontrollers Chapter Quiz',
    objectiveQuestions: [
      {
        id: 'hw-mod-1-q1',
        question: 'Which GPIO register configuration is most suitable for driving an LED directly from a microcontroller pin?',
        options: [
          'Input mode with high-impedance (floating)',
          'Output mode configured as Push-Pull',
          'Output mode configured as Open-Drain',
          'Analog alternate function mode'
        ],
        correctIndex: 1,
        explanation: 'Push-Pull configuration can actively drive a pin both HIGH (source current) and LOW (sink current), which is perfect for driving loads like LEDs. Open-drain can only pull the line low and requires an external pull-up resistor to pull high.'
      },
      {
        id: 'hw-mod-1-q2',
        question: 'Why is non-blocking software debouncing preferred over simple blocking delays (e.g., delay_ms(50)) for push-button interrupts?',
        options: [
          'Simple delays consume more power from the battery',
          'Interrupts do not trigger when blocking delays are active',
          'Simple delays block the CPU from executing other tasks, hurting system responsiveness',
          'Software debouncing increases the clock speed of the MCU'
        ],
        correctIndex: 2,
        explanation: 'Simple blocking delays completely halt CPU execution of other threads/tasks (spinning in a loop). Non-blocking techniques, like using timestamps or timer tick interrupts, allow other operations to execute concurrently.'
      },
      {
        id: 'hw-mod-1-q3',
        question: 'When reading a high-frequency analog signal through an ADC, what is the primary purpose of applying an Exponential Moving Average (EMA) filter?',
        options: [
          'To increase the physical input voltage range of the ADC',
          'To smooth out high-frequency noise and jitter from the sensor readings in real-time',
          'To increase the sampling rate of the ADC',
          'To compress the binary data before storing it in flash memory'
        ],
        correctIndex: 1,
        explanation: 'An Exponential Moving Average (EMA) filter is a computationally lightweight software filter that acts as a digital low-pass filter, smoothing out jitter and noisy fluctuations in ADC samples without requiring massive memory storage.'
      }
    ],
    subjectiveQuestion: {
      id: 'hw-mod-1-subj',
      prompt: 'Design a system that monitors a 12-bit analog thermistor and drives a DC warning motor using PWM. Outline the GPIO configurations, the ADC register settings, and write a small pseudo-code routine in C representing how you would calculate and update the PWM duty cycle based on the averaged temperature input in a non-blocking loop.',
      guidelines: 'Your response must mention: 1. GPIO Pin configurations (Input vs Alternate Function), 2. ADC conversion scaling (0-4095), 3. PWM Timer frequency update, 4. Non-blocking time-checking logic.',
      sampleKeywords: ['GPIO', 'ADC', 'PWM', 'non-blocking', 'timer', 'duty cycle'],
      defaultInstructorFeedback: 'Excellent peripheral orchestration! Your GPIO alternate function mapping and 12-bit ADC scaling are robust. Integrating the Exponential Moving Average filter inside a non-blocking timer poll prevents CPU stall. Approved for next stage.'
    }
  },
  'hw-mod-2': {
    moduleId: 'hw-mod-2',
    title: 'Module 2: Embedded Protocols & Sensors Chapter Quiz',
    objectiveQuestions: [
      {
        id: 'hw-mod-2-q1',
        question: 'What is the standard physical requirement for the I2C bus lines (SDA and SCL) to function correctly?',
        options: [
          'Direct connections to ground',
          'External pull-down resistors on both lines',
          'External pull-up resistors on both lines',
          'A series inductor to reduce transmission speed'
        ],
        correctIndex: 2,
        explanation: 'Because I2C drivers use open-drain outputs, they can only pull lines LOW. They require external pull-up resistors (typically 4.7k ohms) to pull the SDA and SCL lines HIGH when the bus is idle.'
      },
      {
        id: 'hw-mod-2-q2',
        question: 'In high-speed SPI sensor transactions, how does Direct Memory Access (DMA) improve performance?',
        options: [
          'DMA automatically converts SPI into parallel data lines',
          'DMA offloads data transfer between the SPI peripheral registers and RAM, allowing the CPU to perform other operations or sleep',
          'DMA doubles the physical clock frequency of the SPI SCLK line',
          'DMA performs automatic hardware cryptography on the bytes being streamed'
        ],
        correctIndex: 1,
        explanation: 'Direct Memory Access (DMA) manages the byte-by-byte movement from the peripheral data registers directly to RAM buffers entirely in hardware. This keeps the CPU from having to handle interrupts or poll status flags for every single byte, saving massive cycles.'
      },
      {
        id: 'hw-mod-2-q3',
        question: 'Which of the following signals is unique to the SPI protocol compared to the I2C protocol?',
        options: [
          'SDA (Serial Data Line)',
          'SCL (Serial Clock Line)',
          'SS/CS (Slave Select / Chip Select)',
          'ACK/NACK (Acknowledge bits)'
        ],
        correctIndex: 2,
        explanation: 'SPI uses a dedicated Chip Select (CS) or Slave Select (SS) line for each peripheral on the bus, allowing high-speed individual selection. I2C, on the other hand, selects peripherals in software using address packets over SDA.'
      }
    ],
    subjectiveQuestion: {
      id: 'hw-mod-2-subj',
      prompt: 'A high-frequency 3-axis accelerometer is streaming acceleration frames at 1000 Hz. Describe how you would set up a circular DMA buffer on an SPI controller to capture these frames, handle buffer half-complete and complete interrupts, and avoid packet processing race conditions in your main application thread.',
      guidelines: 'Specify how the SPI peripheral transfers bytes, why a circular/double-buffered DMA is helpful, and how you synchronize reading the buffers with the CPU without writing to the same indices.',
      sampleKeywords: ['DMA', 'circular', 'double buffer', 'SPI', 'interrupt', 'race condition', 'mutex', 'flag'],
      defaultInstructorFeedback: 'Superb embedded system modeling! Specifying circular DMA buffers paired with the half-transfer (HT) and transfer-complete (TC) interrupts is the industry standard for non-blocking high-frequency streams. Your race-condition guard is accurate.'
    }
  },

  // SOFTWARE TRACK
  'sw-mod-1': {
    moduleId: 'sw-mod-1',
    title: 'Module 1: High-Performance Client Applications Chapter Quiz',
    objectiveQuestions: [
      {
        id: 'sw-mod-1-q1',
        question: 'In React, which of the following practices is most effective for preventing unnecessary re-renders of child components in a large dashboard layout?',
        options: [
          'Storing all values in global window properties instead of state',
          'Wrapping the child component in React.memo and using state slice selectors (e.g., Zustand/Redux selectors)',
          'Placing the entire dashboard state inside a single monolithic Context Provider',
          'Running forceUpdate() on every user interaction'
        ],
        correctIndex: 1,
        explanation: 'React.memo prevents a component from re-rendering if its props do not change. When paired with Zustand or Redux selectors that return precise primitive fields, only the exact components relying on changed values will re-render.'
      },
      {
        id: 'sw-mod-1-q2',
        question: 'What is the primary performance advantage of utilizing the browser’s native Intersection Observer API for infinite scroll lists over monitoring window scroll events?',
        options: [
          'Intersection Observer speeds up the network request to download items',
          'Intersection Observer runs asynchronously and bypasses the main thread scroll polling, avoiding layout thrashing',
          'Intersection Observer automatically styles the newly loaded items with CSS',
          'Intersection Observer compresses the HTML layout tags'
        ],
        correctIndex: 1,
        explanation: 'Traditional scroll event listeners run synchronously on the main thread and fire continuously, causing heavy paint/reflow overhead. Intersection Observer notifies your application asynchronously when an element hits a screen boundary, saving substantial CPU cycles.'
      },
      {
        id: 'sw-mod-1-q3',
        question: 'In the Web Audio API, which node is used to control the volume output of an audio stream before it reaches the speakers?',
        options: [
          'OscillatorNode',
          'BiquadFilterNode',
          'GainNode',
          'AudioDestinationNode'
        ],
        correctIndex: 2,
        explanation: 'The GainNode acts as a volume controller or multiplier in the Web Audio API, amplifying or attenuating the signal amplitude passing through the audio graph routing chain.'
      }
    ],
    subjectiveQuestion: {
      id: 'sw-mod-1-subj',
      prompt: 'Explain the mechanism behind the React 19 Fiber architecture and reconciliation loops. Then, design an optimization strategy for a real-time system monitoring panel that receives 100 state packets per second. How would you prevent rendering drops and keep the frame rate at a smooth 60fps?',
      guidelines: 'Your response should explain Fiber reconciliation, suggest throttling/batching state updates, and details how useMemo/useCallback or refs can stabilize the layout.',
      sampleKeywords: ['reconciliation', 'Fiber', 'batching', 'throttle', 'requestAnimationFrame', 'useMemo', 'ref', 'Zustand'],
      defaultInstructorFeedback: 'Exceptional client-side engineering! Your grasp of the Fiber scheduler and work loop is deep. Proposing local state batching with requestAnimationFrame or keeping highly volatile coordinate ticks inside mutable Refs is an expert-level performance technique.'
    }
  },
  'sw-mod-2': {
    moduleId: 'sw-mod-2',
    title: 'Module 2: Resilient API Design & Middleware Pipelines Chapter Quiz',
    objectiveQuestions: [
      {
        id: 'sw-mod-2-q1',
        question: 'Which of the following is the most secure method of handling user validation and storing credentials in a scalable Node Express REST API?',
        options: [
          'Storing raw text passwords in the database and matching them in plain text',
          'Hashing passwords using bcrypt/argon2 with a unique salt, and verifying authorization using cryptographically signed JWT tokens',
          'Encrypting passwords using ROT13 and placing them in cookies',
          'Placing user details inside the URL path on every subsequent request'
        ],
        correctIndex: 1,
        explanation: 'Salting and hashing passwords using robust algorithms (like bcrypt or argon2) ensures that database leaks do not expose raw passwords. Issuing cryptographically signed JSON Web Tokens (JWT) allows stateless, secure user verification.'
      },
      {
        id: 'sw-mod-2-q2',
        question: 'How does configuring Redis cache TTL (Time-to-Live) values protect a production database cluster?',
        options: [
          'TTL compresses database rows to save storage space',
          'TTL forces clients to pay for access after a certain duration',
          'TTL ensures stale cache keys are automatically evicted, preventing clients from indefinitely receiving outdated data while preventing memory exhaustion',
          'TTL physically locks database tables during write processes'
        ],
        correctIndex: 2,
        explanation: 'Setting a Time-to-Live (TTL) on Redis keys ensures cached data eventually expires. This ensures that the application pulls fresh, updated data from the source database, and prevents Redis from running out of RAM due to infinite key growth.'
      },
      {
        id: 'sw-mod-2-q3',
        question: 'When implementing database relations in an ORM like Drizzle-ORM, what does a "one-to-many" relationship represent?',
        options: [
          'Every record in Table A is identical to every record in Table B',
          'A single record in Table A can be associated with multiple records in Table B, but each record in Table B links back to only one in Table A',
          'Table A can only have one column, while Table B can have many',
          'The database can only be accessed by one administrator but many read-only guests'
        ],
        correctIndex: 1,
        explanation: 'A one-to-many relationship (e.g., one Course has many Topics, or one Student has many Submissions) allows structured relational references, where parent record IDs are specified as foreign keys inside child records.'
      }
    ],
    subjectiveQuestion: {
      id: 'sw-mod-2-subj',
      prompt: 'Architect a resilient middleware pipeline for an Express API endpoint that handles financial transactions. Specify how you would handle input sanitization with Zod, protect against DDoS using rate-limiters, implement stateless JWT authentication, and ensure transaction ACID compliance at the database tier.',
      guidelines: 'List the order of middleware chain, what happens at each step, and how you roll back database records if a payment step fails.',
      sampleKeywords: ['middleware', 'Zod', 'rate-limiter', 'JWT', 'transaction', 'Express', 'ACID', 'rollback'],
      defaultInstructorFeedback: 'Outstanding API architecture! Your middleware pipeline order (Rate Limiter -> JWT Auth -> Zod Validation -> Transaction execution) is completely bulletproof. Utilizing DB transactions for immediate rollbacks on payment failure prevents account sync glitches.'
    }
  },

  // DATA SCIENCE TRACK
  'ds-mod-1': {
    moduleId: 'ds-mod-1',
    title: 'Module 1: Scientific Computing & EDA Chapter Quiz',
    objectiveQuestions: [
      {
        id: 'ds-mod-1-q1',
        question: 'Why is it highly recommended to use vectorized operations (e.g., NumPy array multiplication) rather than nested for-loops to transform millions of rows in Pandas?',
        options: [
          'For-loops are deprecated in modern Python versions',
          'Vectorization compiles code on-the-fly to machine language, utilizing SIMD processor registers for massive parallel execution speeds',
          'Vectorized operations use fewer lines of code, though they execute at the same speed',
          'Vectorization automatically encrypts the dataset'
        ],
        correctIndex: 1,
        explanation: 'Vectorized operations in Pandas and NumPy run compiled C-code under the hood. They make use of Single Instruction Multiple Data (SIMD) capabilities of modern processors, executing millions of calculations in parallel and outperforming pure-Python for-loops by orders of magnitude.'
      },
      {
        id: 'ds-mod-1-q2',
        question: 'What is the core purpose of Principal Component Analysis (PCA) when preparing a high-dimensional dataset for visualization?',
        options: [
          'PCA deletes columns that have any missing values',
          'PCA reduces the dataset dimensionality by projecting features onto principal axes of maximum variance, preserving the statistical distance between records in lower-dimensional space',
          'PCA increases the number of features by generating random data variations',
          'PCA translates text columns into numeric indicators automatically'
        ],
        correctIndex: 1,
        explanation: 'PCA (Principal Component Analysis) is a linear dimensionality reduction technique. It transforms high-dimensional features into orthogonal dimensions (principal components) ordered by variance, allowing you to plot multidimensional records on a 2D or 3D scatter plot while maintaining global variance patterns.'
      },
      {
        id: 'ds-mod-1-q3',
        question: 'What does a Pandas dataframe pivot_table operation do?',
        options: [
          'It rotates the physical monitor displaying the dataframe',
          'It summarizes and aggregates table records, converting unique row values into column headers for structural multi-index grouping',
          'It deletes the active dataframe index and reverts to a list format',
          'It plots a line graph of the records'
        ],
        correctIndex: 1,
        explanation: 'The pivot_table method reshapes a DataFrame by summarizing data. It groups records along specified indices and columns, applying aggregation functions (like mean, sum, or count) to construct a structured analytical grid.'
      }
    ],
    subjectiveQuestion: {
      id: 'ds-mod-1-subj',
      prompt: 'A large CSV contains 10 million telemetry readings with high collinearity across 40 sensors. Outline your step-by-step Exploratory Data Analysis (EDA) pipeline using Python. Explain how you would check for collinearity, perform standard scaling, and apply PCA to reduce the features for interactive D3 plotting.',
      guidelines: 'State which methods from Pandas, Scikit-learn, or Seaborn you would call, how you choose the number of principal components, and how to represent variance.',
      sampleKeywords: ['PCA', 'StandardScaler', 'Pandas', 'correlation matrix', 'collinearity', 'scree plot', 'D3', 'variance'],
      defaultInstructorFeedback: 'Excellent statistical pipeline formulation! Utilizing a Pearson correlation matrix first to identify multicollinearity, followed by StandardScaler to prevent variance scaling bias before PCA, is the mathematically sound approach. A scree plot recommendation is spot-on.'
    }
  },
  'ds-mod-2': {
    moduleId: 'ds-mod-2',
    title: 'Module 2: Machine Learning & Neural Networks Chapter Quiz',
    objectiveQuestions: [
      {
        id: 'ds-mod-2-q1',
        question: 'When training a Gradient Boosting machine (like XGBoost), how are subsequent decision trees constructed?',
        options: [
          'Each tree is trained completely independently on random data columns',
          'Each tree is trained to predict the residual errors (gradients) of the cumulative ensemble of all previous trees',
          'Trees are generated by merging random nodes together',
          'Subsequent trees have their learning rates multiplied by a random factor'
        ],
        correctIndex: 1,
        explanation: 'Gradient Boosting is an ensemble technique where trees are built sequentially. Each subsequent tree attempts to fit and correct the residual errors (or gradients of the loss function) made by the combination of all previously trained trees.'
      },
      {
        id: 'ds-mod-2-q2',
        question: 'In PyTorch, what is the significance of calling loss.backward() during a neural network training loop?',
        options: [
          'It resets all model layer weights back to random configurations',
          'It initiates backpropagation, calculating the gradients of the loss function with respect to all learnable parameters/tensors',
          'It prints the accuracy of the neural network inside the terminal',
          'It saves the training metrics to an external cloud database'
        ],
        correctIndex: 1,
        explanation: 'Calling backward() triggers PyTorch\'s autograd engine to traverse the dynamic computation graph in reverse, calculating the partial derivatives (gradients) of the loss with respect to each model weight so the optimizer can update them.'
      },
      {
        id: 'ds-mod-2-q3',
        question: 'What is the role of an activation function like ReLU (Rectified Linear Unit) inside a multi-layer feedforward neural network?',
        options: [
          'To compress the input values between -1 and +1',
          'To introduce non-linearity into the network, enabling it to learn complex non-linear decision boundaries',
          'To speed up file saving operations on local disks',
          'To automatically double the learning rate of the optimizer'
        ],
        correctIndex: 1,
        explanation: 'Without non-linear activation functions, stacking multiple linear layers would simply collapse into a single linear equation, restricting the network to learning basic linear partitions. ReLU introduces non-linearity (thresholding negative values to zero), unlocking deep non-linear modeling.'
      }
    ],
    subjectiveQuestion: {
      id: 'ds-mod-2-subj',
      prompt: 'Draft a PyTorch training loop from scratch for a multi-class neural classifier. Include the forward pass, custom cross-entropy loss calculation, Adam optimizer setup, backward pass gradients execution, optimizer update, and gradient reset on each batch.',
      guidelines: 'Write pseudo-code or PyTorch python script showing zero_grad, loss.backward(), and optimizer.step() placement inside an epoch loop.',
      sampleKeywords: ['PyTorch', 'zero_grad', 'loss.backward()', 'optimizer.step()', 'epoch', 'forward', 'optimizer', 'CrossEntropyLoss'],
      defaultInstructorFeedback: 'Flawless PyTorch cycle implementation! Your ordering of steps inside the training batch loop is completely correct: zeroing the gradients, calculating predictions, calculating cross-entropy loss, executing backpropagation, and taking the optimizer step.'
    }
  }
};

export const OVERALL_ASSESSMENTS: Record<string, OverallCourseAssessment> = {
  'track-hardware': {
    trackId: 'track-hardware',
    title: 'The Hardware Course Overall Certification Assessment',
    objectiveQuestions: [
      {
        id: 'hw-all-q1',
        question: 'Which serial protocol utilizes a master-slave topology with MOSI, MISO, SCLK, and individual SS select wires, operating at high frequencies without pull-up constraints?',
        options: ['I2C Bus', 'SPI Bus', 'UART Serial', 'CAN Bus'],
        correctIndex: 1,
        explanation: 'SPI (Serial Peripheral Interface) uses dedicated synchronous lines (MOSI, MISO, SCLK) and Slave Select (SS/CS) lines per peripheral. It has push-pull drivers, avoiding I2C pull-up bottlenecks and enabling ultra-high-speed bidirectional streams.'
      },
      {
        id: 'hw-all-q2',
        question: 'What occurs when an ARM Cortex-M micro-controller pin configured as a push-pull GPIO is directly short-circuited to Ground while set to digital HIGH?',
        options: [
          'The micro-controller safely clocks down automatically',
          'The pin sources maximum short-circuit current, potentially overheating and permanently damaging the pin silicon channel',
          'The compiler rejects subsequent builds automatically',
          'The GPIO automatically switches itself into analog mode'
        ],
        correctIndex: 1,
        explanation: 'In push-pull output HIGH, the internal PMOS transistor is fully conducting, forming a direct low-resistance path to VDD. Short-circuiting this output directly to ground pulls extreme currents through the silicon junction, exceeding thermal thresholds and burning out the gate.'
      },
      {
        id: 'hw-all-q3',
        question: 'How do you prevent a watch-dog timer (WDT) from resetting an embedded device during normal execution?',
        options: [
          'You delete the watch-dog driver before deploying the build',
          'You regularly call a "kick/feed watch-dog" routine in your main application loop before the timer interval expires',
          'You keep the micro-controller in persistent sleep mode',
          'You lower the power supply voltage'
        ],
        correctIndex: 1,
        explanation: 'A watch-dog timer is a safety circuit that resets the MCU if the code hangs or crashes. To indicate healthy execution, the application must regularly "feed" or "kick" the watchdog counter, resetting its timer. If the code hangs, the watchdog isn\'t fed, it overflows, and the device restarts safely.'
      },
      {
        id: 'hw-all-q4',
        question: 'What is the role of an active low pass RC filter connected to the input of an Analog-to-Digital Converter channel?',
        options: [
          'To amplify weak voltages',
          'To suppress high-frequency noise and prevent aliasing of frequencies higher than half the sampling rate (Nyquist frequency)',
          'To increase the reference voltage of the ADC',
          'To convert serial data into parallel voltage signals'
        ],
        correctIndex: 1,
        explanation: 'An anti-aliasing low-pass RC filter limits the analog input bandwidth, preventing high-frequency noise and signals above half the sampling rate (the Nyquist limit) from aliasing into the digital samples as false lower-frequency waveforms.'
      },
      {
        id: 'hw-all-q5',
        question: 'Which embedded protocol is asynchronous, using only TX and RX lines without a shared hardware clock line, relying instead on pre-configured baud rates?',
        options: ['I2C', 'SPI', 'UART', 'JTAG'],
        correctIndex: 2,
        explanation: 'UART (Universal Asynchronous Receiver-Transmitter) transmits data asynchronously without a clock line. Both the transmitter and receiver must agree on standard transmission speed parameters (baud rates, start/stop bit structures) beforehand.'
      }
    ],
    subjectiveQuestion: {
      id: 'hw-all-subj',
      prompt: 'Architect a complete IoT weather monitoring station from the silicon level. The station must continuously sample temperature (analog thermistor, requiring ADC and filtering), query wind speed (digital SPI sensor, requiring high frequency circular DMA buffers), and stream telemetry packets over UART serial. Detail your peripheral mapping, your interrupt service routines (ISR), and outline your non-blocking main scheduling loop.',
      guidelines: 'Your design must show structured pseudocode or an execution plan detailing: 1. ADC DMA channel configuration, 2. SPI DMA interrupt handling, 3. UART packet framing with checksum calculations, 4. Watchdog timer integration.',
      sampleKeywords: ['DMA', 'ADC', 'SPI', 'UART', 'ISR', 'watchdog', 'circular buffer', 'checksum', 'main loop', 'non-blocking'],
      defaultInstructorFeedback: 'A breathtaking, highly comprehensive system architecture design! Your peripheral map, circular SPI DMA buffer integration, and checksummed UART packet framing demonstrate elite bare-metal mastery. The watchdog integration guarantees operational uptime in field deployments. Highly Approved!'
    }
  },
  'track-software': {
    trackId: 'track-software',
    title: 'The Software Course Overall Certification Assessment',
    objectiveQuestions: [
      {
        id: 'sw-all-q1',
        question: 'Which of the following describes the "event loop" processing model in Node.js?',
        options: [
          'It spawns a new operating system thread for every incoming HTTP request',
          'It is a single-threaded execution model that delegates blocking I/O tasks to a background thread pool (libuv), notifying the main thread via a callback queue upon completion',
          'It halts all executions until database transactions complete',
          'It runs client rendering calculations inside server RAM'
        ],
        correctIndex: 1,
        explanation: 'Node.js uses a single-threaded event loop for your JavaScript execution. When blocking operations (like database queries, cryptography, or file writes) occur, Node delegates them to background threads managed by the libuv library, letting the event loop process other requests without blocking.'
      },
      {
        id: 'sw-all-q2',
        question: 'Why are JSON Web Tokens (JWT) considered statelessly authenticable, unlike traditional session-id cookies?',
        options: [
          'JWTs are stored on paper instead of digital servers',
          'JWTs contain signed user claims in their payload that the server can cryptographically verify using a secret key without querying a database on every request',
          'JWTs are automatically registered with regional internet authorities',
          'JWTs require clients to re-authenticate on every mouse click'
        ],
        correctIndex: 1,
        explanation: 'A JWT contains three base64-encoded segments: header, payload, and signature. Because the signature is created using a server secret key, the server can verify the token\'s integrity and extract claims (user ID, permissions) instantly, removing database lookups for session states.'
      },
      {
        id: 'sw-all-q3',
        question: 'Which design pattern is best suited for keeping client layouts responsive when a user opens multiple browser tabs that must listen to the same backend server changes concurrently?',
        options: [
          'Heavy HTTP polling every 10 milliseconds in all tabs',
          'A single shared WebSocket or Server-Sent Events (SSE) stream, paired with local state broadcasters (BroadcastChannel API)',
          'Generating a separate virtual server for each browser tab',
          'Caching all server records in the browser\'s cookies'
        ],
        correctIndex: 1,
        explanation: 'Establishing a single real-time stream (WebSockets or SSE) is highly efficient. When paired with BroadcastChannel, open browser tabs can broadcast incoming server updates locally, avoiding multiple concurrent socket links and reducing server resource footprints.'
      },
      {
        id: 'sw-all-q4',
        question: 'What is the role of a middleware function in an Express.js application?',
        options: [
          'It connects the physical server to the regional fiber-optic cables',
          'It compiles JavaScript into machine binary code',
          'It executes mid-route, enjoying access to the Request and Response objects to authorize, validate, or mutate requests before calling the next() handler',
          'It renders the final visual React layout on the client'
        ],
        correctIndex: 2,
        explanation: 'Express middleware functions are executed in a sequential chain. They intercept incoming requests, letting you implement authentication, request sanitization, logging, or error handlers before delegating control to final controller actions.'
      },
      {
        id: 'sw-all-q5',
        question: 'What is "n+1 query problem" in database ORMs and how can it be resolved?',
        options: [
          'A calculation bug where values are incremented by 1 extra unit',
          'An inefficiency where fetching a parent record along with its associated N child records results in executing N+1 individual SQL queries; resolved using eager loading, joins, or batch prefetching',
          'A crash that occurs when more than N users access the server',
          'An authorization bug that locks tables'
        ],
        correctIndex: 1,
        explanation: 'The N+1 problem occurs when an ORM fetches a parent list (1 query) and then loops through each parent to run another query for its children (N queries). This is highly inefficient and is resolved by eager loading the children using SQL JOIN statements or batching queries together.'
      }
    ],
    subjectiveQuestion: {
      id: 'sw-all-subj',
      prompt: 'Architect a highly available, real-time ticket booking platform that handles 50,000 requests per minute during major launch events. Detail your client-side render performance optimizations, your API gateway middleware layer, your caching eviction policies, your real-time socket infrastructure, and how you prevent double-booking race conditions during extreme transactional concurrency.',
      guidelines: 'Your architectural proposal must outline: 1. React virtual scrolling and state selectors, 2. API rate limiting and token bucket protection, 3. Redis distributed locking or database transactional row locks for bookings, 4. Scalable WebSocket state broadcasting.',
      sampleKeywords: ['Zustand', 'virtual list', 'rate limiting', 'Redis lock', 'concurrency', 'ACID', 'WebSocket', 'Express middleware', 'BroadcastChannel'],
      defaultInstructorFeedback: 'An absolute masterpiece of software architecture! Your integration of Zustand state slicing, Redis-based distributed locks (or SELECT FOR UPDATE row locks), rate-limiting middleware, and multi-tab sync channels represents elite full-stack system design. Completely bulletproof under heavy loads.'
    }
  },
  'track-data': {
    trackId: 'track-data',
    title: 'The Data Science Course Overall Certification Assessment',
    objectiveQuestions: [
      {
        id: 'ds-all-q1',
        question: 'In statistical modeling, what is the core issue associated with "multicollinearity"?',
        options: [
          'When columns are colored differently inside Jupyter Notebooks',
          'When multiple predictor variables in a regression model are highly correlated, inflating variance of coefficient estimates and making it difficult to isolate individual feature impacts',
          'When the dataset contains more than one hundred columns',
          'When the average value of a target column is lower than zero'
        ],
        correctIndex: 1,
        explanation: 'Multicollinearity occurs when independent variables are highly linearly correlated. This makes model parameters unstable and highly sensitive to small changes, making it difficult to assess feature importance accurately.'
      },
      {
        id: 'ds-all-q2',
        question: 'What is the role of the learning rate hyper-parameter when training a model using Gradient Descent?',
        options: [
          'It determines the physical clock speed of the graphic card',
          'It acts as a scaling factor, multiplying the calculated gradients to dictate the step size the optimizer takes toward the loss function minimum',
          'It automatically deletes bad feature records during training',
          'It represents the percentage of data used for training'
        ],
        correctIndex: 1,
        explanation: 'The learning rate is a scalar multiplier applied to the gradients. It controls how far model weights are moved on each optimization step. Setting it too high can cause the model to overshoot the minimum, while setting it too low makes training painfully slow.'
      },
      {
        id: 'ds-all-q3',
        question: 'Which validation strategy is most suitable for assessing model performance on a temporal/time-series dataset?',
        options: [
          'Standard K-Fold Cross Validation with random shuffling',
          'Time Series Split (rolling origin), where training folds only contain historic records preceding the validation fold',
          'Duplicating the final row multiple times',
          'Excluding the timestamp column and training on random samples'
        ],
        correctIndex: 1,
        explanation: 'Shuffling or standard cross-validation on time-series data leaks future information into the past, leading to over-optimistic validation metrics. A rolling-origin/walk-forward validation strategy ensures you only train on past data and validate on future data.'
      },
      {
        id: 'ds-all-q4',
        question: 'What does a "confusion matrix" display for a classifier model?',
        options: [
          'A table explaining why the computer failed to compile',
          'A detailed grid of True Positives, False Positives, True Negatives, and False Negatives, allowing direct calculation of Precision, Recall, and F1-Score',
          'A list of columns with highly confusing names',
          'A chart of memory leakage coordinates'
        ],
        correctIndex: 1,
        explanation: 'A confusion matrix cross-references predicted classes against actual target classes. This provides a clear, detailed map of classification outcomes, allowing deep analysis of where predictions fail beyond basic accuracy averages.'
      },
      {
        id: 'ds-all-q5',
        question: 'Why are convolutional neural networks (CNNs) heavily preferred over dense, fully connected neural networks for analyzing image data?',
        options: [
          'CNNs require more RAM and execute slower',
          'CNNs utilize localized weight-sharing kernels to extract spatial features (like edges, textures, and shapes), preserving spatial relationships with fewer parameters',
          'CNNs are the only networks supported on Python',
          'CNNs automatically convert color images into black and white'
        ],
        correctIndex: 1,
        explanation: 'Dense layers fully connect every input pixel to every output neuron, ignoring 2D coordinate structures and generating a massive, unmanageable parameter count. CNNs use small weight-sharing convolutional kernels that slide across the image, preserving spatial patterns while being highly efficient.'
      }
    ],
    subjectiveQuestion: {
      id: 'ds-all-subj',
      prompt: 'Design an end-to-end Machine Learning pipeline that predicts device failures based on continuous streaming hardware telemetries. Detail your data ingestion strategy, your feature engineering pipeline (handling missing readings, lagging trends, and outliers), your class-imbalance correction method (as failures are rare), and your PyTorch deep neural network architecture. Explain how you prevent temporal leakage and monitor feature drift in production.',
      guidelines: 'Your pipeline must outline: 1. Vectorized pandas feature creation, 2. Synthetic oversampling (e.g., SMOTE) or weighted focal loss for imbalance, 3. Walk-forward time-series splitting, 4. Layer activations and loss logging.',
      sampleKeywords: ['pandas', 'PyTorch', 'imbalance', 'focal loss', 'SMOTE', 'drift', 'leakage', 'time-series split', 'scaler', 'feature drift'],
      defaultInstructorFeedback: 'An absolute tour de force in machine learning system design! Your temporal walk-forward split completely eliminates leakage risks, and your combination of weighted focal loss and vectorized rolling lags handles extreme class imbalance beautifully. The feature drift alert proposal shows true enterprise maturity.'
    }
  }
};
