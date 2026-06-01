# Oracle VirtualBox: Black Screen Recovery Protocol

If you encounter a black screen when booting the SpartanAI Apex ISO in Oracle VirtualBox, execute the following configuration overrides to achieve visual synchronization.

## 🛠️ Mandatory Hardware Configuration
1.  **System -> Motherboard**:
    *   Enable **EFI** (Special-case: Only if using the EFI bootloader).
    *   Ensure **Hardware Virtualization** (VT-x/AMD-V) is enabled in your host BIOS.
2.  **Display -> Screen**:
    *   **Graphics Controller**: Set to **VBoxSVGA** (Legacy/Stable) or **VMSVGA** (Modern). 
        *   *Note: If one results in a black screen, toggle to the other.*
    *   **Video Memory**: Increase to at least **128 MB** (Recommended: 256 MB).
    *   **Acceleration**: Enable **3D Acceleration**.
3.  **Processor**:
    *   Ensure at least **2 Cores** are allocated.
    *   Enable **PAE/NX**.

## 🖥️ Boot-Time Overrides
If the screen remains black after the GRUB menu:
1.  In the GRUB menu, highlight the "Live" entry and press `e`.
2.  Find the line starting with `linux /live/vmlinuz...`.
3.  Append `nomodeset` to the end of that line.
4.  Press `F10` to boot. This bypasses the kernel's video driver until the system is fully initialized.

## ✅ Verification
Once the desktop environment (XFCE/Plasma) initializes, the **SpartanAI Dashboard** will automatically render using the high-fidelity WebGL shader engine.

**STATUS: VISUAL_UPLINK_STABILIZED**
