# 图标生成提示词

生成模式：内置 image_gen。生成的方形原图保存为 `dayun-kicker-v2-source.png`，经尺寸与 sRGB 转换得到 1024 px 主图。

```text
Use case: stylized-concept
Asset type: production app icon master artwork for the arcade electric-moped game 暴力电驴 / Dayun Kicker, shared by iOS and macOS.
Primary request: redesign the existing game's busy electric-scooter-and-lightning identity into a bold, beautifully sculpted, immediately recognizable modern game app icon.
Subject: ONE compact seated electric moped / Chinese city e-scooter (NOT a standing kick scooter, NOT a racing motorcycle), coral-red curved body, warm ivory front leg shield and fender, graphite chunky tires and black saddle, cyan accent on the side panel, a small round warm-white headlamp. Clear complete scooter silhouette with exactly two wheels, clear handlebar, seat and step-through footwell. Three-quarter view, front wheel on lower right, rear wheel lower left. The scooter leans slightly forward as if launching fast. Behind it, ONE large warm golden-yellow angular lightning bolt, pointing diagonally from upper right toward lower left, providing a memorable electric-energy silhouette. Two short thick cyan motion streaks tucked behind the rear wheel at left.
Scene/backdrop: full-bleed deep midnight teal-blue background, soft restrained gradient from slightly lighter upper left to darker lower right. No ground plane, no scenery.
Style/medium: premium playful 3D game-icon illustration with softly bevelled sculpted solid shapes, clean enamel surfaces, tactile depth and broad readable highlights. Deliberate chunky proportions, strong silhouette, crisp contour separation. A polished arcade game identity, not a tiny realistic vehicle model.
Composition/framing: exactly square 1024 x 1024 artwork, centered balanced composition; scooter fills roughly 70 percent of width, lightning in the upper-middle behind scooter. Keep all important subject elements inside the central 78 percent of canvas, safe for system corner cropping. Strong readable shapes at 32px. Icon ART ONLY, no presentation board.
Lighting/mood: soft studio light from upper left, cheerful high-energy action. Subtle object shading, restrained highlights; no glows or specular bloom.
Color palette: coral red #FF514D, warm golden yellow #FFD447, cyan #4BD4FF, warm ivory, deep blue-teal.
Text: none.
Constraints: fully opaque square edge-to-edge canvas, filled all the way to all four corners. NO rounded corners, no squircle mask, no border, no badge ring, no inset icon tile, no outer frame, no outer drop shadow, no transparency. No text, no letters, no numbers, no logos, no rider, no truck, no city, no decorative sparkles, no watermarks. Generate one finished app icon artwork.
```

macOS 最终资源由 Apple Icon Composer / actool 从 `DayunKicker.icon` 导出：系统生成圆角、外侧透明留白和 Retina 尺寸。最终资源未使用 AI 生成的圆角蒙版。
