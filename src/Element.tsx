import { AtomModel } from './AtomModel';
import { ElementData } from './data/elementsDB';

interface ElementProps {
  elementData: ElementData;
  rotationSpeed?: number;
}

export function Element({ elementData, rotationSpeed = 1.0 }: ElementProps) {
  return (
    <AtomModel
      protonCount={elementData.protons}
      neutronCount={elementData.neutrons}
      electronShells={elementData.electronShells}
      nucleusRadius={elementData.nucleusRadius}
      particleRadius={elementData.particleRadius}
      rotationSpeed={rotationSpeed}
    />
  );
}
