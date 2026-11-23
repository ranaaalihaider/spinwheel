# 06 — Spin Wheel & Cryptographic Selection Algorithm
## AWS Student Builder Group — COMSATS University Islamabad

---

## 1. Cryptographic Fairness Specification

Standard `Math.random()` is not cryptographically secure and can exhibit PRNG periodicity biases. Furthermore, taking `randomUint32 % N` directly introduces **modulo bias** whenever `N` does not evenly divide $2^{32}$.

### 1.1 Unbiased Rejection Sampling Algorithm
Implemented in `src/utils/cryptoRandom.ts`:

Given an eligible pool of size $N$ ($1 \le N \le 2^{32} - 1$):
1. Define the maximum usable multiple of $N$ within the 32-bit unsigned integer space:
   $$\text{limit} = 2^{32} - (2^{32} \bmod N)$$
2. Draw a random 32-bit unsigned integer $r \in [0, 2^{32} - 1]$ using `window.crypto.getRandomValues(new Uint32Array(1))`.
3. If $r \ge \text{limit}$, **reject** $r$ and draw again.
4. Return the winner index:
   $$k = r \bmod N$$

Because $\text{limit}$ is an exact multiple of $N$, every index $k \in \{0, 1, \dots, N-1\}$ has an identical probability of selection:
$$P(\text{select } k) = \frac{\text{limit} / N}{\text{limit}} = \frac{1}{N}$$

---

## 2. Deterministic Target Angle Calculation

The winner is chosen **before** the wheel begins rotating. The animation is mathematically slaved to land on the chosen winner's segment.

### 2.1 Coordinate System
- Canvas angle $0\text{ rad}$ points along the positive X-axis (3 o'clock).
- The fixed jewelled pointer is mounted at the **top-center (12 o'clock)** of the wheel:
  $$\theta_{\text{pointer}} = \frac{3\pi}{2}\text{ rad } (270^\circ)$$
- Let $M$ be the number of segments rendered on the wheel ($M = \min(N, 48)$).
- Each slice $i \in \{0, 1, \dots, M-1\}$ spans an angular arc of:
  $$\Delta\theta = \frac{2\pi}{M}$$
- At wheel rotation angle $R = 0$, slice $i$ spans:
  $$[\,i \cdot \Delta\theta,\; (i + 1) \cdot \Delta\theta\,]$$
  with slice center at:
  $$\theta_{\text{center}}(i) = \left(i + 0.5\right) \cdot \Delta\theta$$

### 2.2 Solving for Final Wheel Rotation $R_{\text{final}}$
When the wheel rotates clockwise by $R_{\text{final}}$ radians, the center of slice $i_{\text{win}}$ moves to angle:
$$\left(\theta_{\text{center}}(i_{\text{win}}) + R_{\text{final}}\right) \bmod 2\pi$$

To align slice $i_{\text{win}}$ under the top pointer ($\theta_{\text{pointer}} = \frac{3\pi}{2}$), with a natural sub-slice jitter offset $\delta \in [-0.28\Delta\theta, +0.28\Delta\theta]$ (so the pointer lands comfortably inside the winning slice without ever crossing a boundary):

$$\theta_{\text{targetMod}} = \left(\frac{3\pi}{2} - \theta_{\text{center}}(i_{\text{win}}) + \delta\right) \bmod 2\pi$$

Given current cumulative wheel rotation $R_{\text{current}}$:
1. Compute the forward angular distance to reach $\theta_{\text{targetMod}}$:
   $$\theta_{\text{delta}} = \left(\theta_{\text{targetMod}} - (R_{\text{current}} \bmod 2\pi) + 2\pi\right) \bmod 2\pi$$
2. Add $K$ full revolutions ($K \in \{7, 8, 9\}$ full $2\pi$ turns):
   $$R_{\text{final}} = R_{\text{current}} + K \cdot 2\pi + \theta_{\text{delta}}$$

### 2.3 Verification Invariant
At completion ($R = R_{\text{final}}$), the slice index directly beneath the top pointer is given by:
$$i_{\text{verify}} = \left\lfloor \frac{\left(\frac{3\pi}{2} - (R_{\text{final}} \bmod 2\pi) + 2\pi\right) \bmod 2\pi}{\Delta\theta} \right\rfloor \bmod M$$
Our unit test suite asserts that $i_{\text{verify}} === i_{\text{win}}$ across 10,000 randomized trials.

---

## 3. Physics & Easing Curve

- **Spin Duration**: `6000ms` (6.0 seconds) in standard mode; `150ms` instant settle when `prefers-reduced-motion: reduce` is active.
- **Easing Function**: Custom multi-stage quintic deceleration with subtle initial torque ramp:
  $$E(t) = 1 - (1 - t)^4 \cdot (1 + 0.35t)$$
  normalized over $t \in [0, 1]$ so $E(0) = 0$, $E(1) = 1$, and $E'(1) = 0$.
- **Pointer Peg Physics**: Each time a segment boundary passes $\theta_{\text{pointer}}$, the top pointer deflects by up to $18^\circ$ proportional to instantaneous angular velocity $\omega(t)$ and springs back smoothly, simultaneously triggering a Web Audio mechanical tick.

---

## 4. Adaptive Windowed Strategy for Large Participant Pools ($N > 48$)

When a Google Sheet contains e.g. $N = 250$ eligible students:
1. **Full-Pool Selection**: The cryptographic RNG selects $k_{\text{pool}} \in \{0, \dots, 249\}$ with exact $1/250$ probability. Let $W = \text{eligiblePool}[k_{\text{pool}}]$.
2. **Display Window Construction**:
   - The wheel display cap is $M = 48$ slices so every name on the wheel maintains at least a $7.5^\circ$ arc.
   - When a spin starts, if $W$ is not already in the current 48-slice display window, $W$ is placed into a cryptographically chosen display slot $i_{\text{win}} \in \{0, \dots, 47\}$ alongside 47 distinct peers sampled from the remaining 249 eligible participants.
3. **Visual Consistency**: The wheel rotates through 7–9 full turns and decelerates smoothly onto slot $i_{\text{win}}$, whose rendered label is $W.\text{name}$.

---

## 5. Concurrency & State Freeze Guarantees

When the organizer clicks **"SPIN THE WHEEL"**:
1. `status` transitions atomically from `'idle'` to `'spinning'`.
2. An immutable snapshot of the eligible pool is locked for the duration of the spin.
3. Both the **"SPIN THE WHEEL"** button and the **"Refresh Participants"** button are disabled while `status === 'spinning'`.
4. Any duplicate click events or keyboard triggers (`Enter`/`Space`) during `'spinning'` are ignored.
5. An animation cancellation token cleans up the `requestAnimationFrame` loop if the component unmounts mid-spin.
