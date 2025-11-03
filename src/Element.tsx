import { AtomModel } from './AtomModel';
import { ElementData } from './data/elementsDB';

interface ElementProps {
  elementData: ElementData;
}

export function Element({ elementData }: ElementProps) {
  return (
    <AtomModel
      protonCount={elementData.protons}
      neutronCount={elementData.neutrons}
      electronShells={elementData.electronShells}
      nucleusRadius={elementData.nucleusRadius}
      particleRadius={elementData.particleRadius}
    />
  );
}
